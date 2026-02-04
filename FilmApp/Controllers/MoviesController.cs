using FilmApp.Api.Data;
using FilmApp.Api.Dtos;
using FilmApp.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;




namespace FilmApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MoviesController : ControllerBase
{
    private readonly AppDbContext _db;

    public MoviesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<MovieOutput>>> GetAll(
        [FromQuery] List<int>? categoryIds,
        [FromQuery] string? search = null,
        [FromQuery] ContentType? type = null,
        [FromQuery] CategoryFilterMode mode = CategoryFilterMode.Any,
        [FromQuery] MovieSortBy sortBy = MovieSortBy.Title,
        [FromQuery] SortDirection sortDir = SortDirection.Asc,
        [FromQuery] bool onlyLiked = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
        )
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var countQuery = _db.Movies.AsQueryable();
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);



        Expression<Func<Movie, double>> ratingScore =
        m => m.Ratings.Select(r => (double?)r.Score).Average() ?? 0;


        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            countQuery = countQuery.Where(m => EF.Functions.Like(m.Title, pattern));
        }


        if (type.HasValue)
            countQuery = countQuery.Where(m => m.Type == type.Value);


        if (categoryIds is { Count: > 0 })
        {
            if (mode == CategoryFilterMode.Any)
            {
                countQuery = countQuery.Where(m => m.MovieCategories.Any(mc => categoryIds.Contains(mc.CategoryId)));
            }
            else 
            {
                countQuery = countQuery.Where(m =>
                    m.MovieCategories.All(mc => categoryIds.Contains(mc.CategoryId)) &&
                    m.MovieCategories.Select(mc => mc.CategoryId).Distinct().Count() == categoryIds.Distinct().Count());
            }
        }

        if (onlyLiked)
        {
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            countQuery = countQuery.Where(m => m.Likes.Any(l => l.UserId == userId));
        }

        countQuery = (sortBy, sortDir) switch
        {
            (MovieSortBy.Year, SortDirection.Desc) => countQuery.OrderByDescending(m => m.Year),
            (MovieSortBy.Year, SortDirection.Asc) => countQuery.OrderBy(m => m.Year),
            (MovieSortBy.Rating, SortDirection.Desc) => countQuery.OrderByDescending(ratingScore).ThenBy(m => m.Title),
            (MovieSortBy.Rating, SortDirection.Asc) => countQuery.OrderBy(ratingScore).ThenBy(m => m.Title),
            (MovieSortBy.Title, SortDirection.Desc) => countQuery.OrderByDescending(m => m.Title),
            _ => countQuery.OrderBy(m => m.Title),
        };

        var totalCount = await countQuery.CountAsync();

        var query = _db.Movies
            .Include(m => m.MovieCategories)
            .ThenInclude(mc => mc.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            query = query.Where(m => EF.Functions.Like(m.Title, pattern));
        }


        if (type.HasValue)
            query = query.Where(m => m.Type == type.Value);


        if (categoryIds is { Count: > 0 })
        {
            if (mode == CategoryFilterMode.Any)
            {
                query = query.Where(m => m.MovieCategories.Any(mc => categoryIds.Contains(mc.CategoryId)));
            }
            else 
            {
                query = query.Where(m =>
                    m.MovieCategories.All(mc => categoryIds.Contains(mc.CategoryId)) &&
                    m.MovieCategories.Select(mc => mc.CategoryId).Distinct().Count() == categoryIds.Distinct().Count());
            }
        }

        if (onlyLiked)
        {
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
            query = query.Where(m => m.Likes.Any(l => l.UserId == userId));
        }


        query = (sortBy, sortDir) switch
        {
            (MovieSortBy.Year, SortDirection.Desc) => query.OrderByDescending(m => m.Year),
            (MovieSortBy.Year, SortDirection.Asc) => query.OrderBy(m => m.Year),
            (MovieSortBy.Rating, SortDirection.Desc) => query.OrderByDescending(ratingScore).ThenBy(m => m.Title),
            (MovieSortBy.Rating, SortDirection.Asc) => query.OrderBy(ratingScore).ThenBy(m => m.Title),
            (MovieSortBy.Title, SortDirection.Desc) => query.OrderByDescending(m => m.Title),
            _ => query.OrderBy(m => m.Title),
        };

        query = query.Skip((page - 1) * pageSize).Take(pageSize);

        var items = await query
            .Select(m => new MovieOutput
            {
                Id = m.Id,
                Title = m.Title,
                Type = m.Type,
                Description = m.Description,
                CoverUrl = m.CoverUrl,
                Year = m.Year,
                DurationMinutes = m.DurationMinutes,
                SeasonsCount = m.SeasonsCount,
                EpisodesCount = m.EpisodesCount,
                Rating = m.Ratings.Select(r => (double?)r.Score).Average() ?? 0,
                RatingCount = m.Ratings.Count,
                LikesCount = m.Likes.Count,
                LikedByMe = userId != null && m.Likes.Any(l => l.UserId == userId),
                Categories = m.MovieCategories
                    .Select(mc => new MovieCategoryOutput { Id = mc.Category.Id, Name = mc.Category.Name })
                    .OrderBy(c => c.Name)
                    .ToList()
            })
            .ToListAsync();



        return Ok(new PagedResult<MovieOutput>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }





    [HttpGet("{id:int}")]
    public async Task<ActionResult<MovieOutput>> GetById(int id)
    {
        var movie = await _db.Movies
            .Include(m => m.MovieCategories).ThenInclude(mc => mc.Category)
            .Include(m => m.Ratings)
            .Include(m => m.Likes)
            .FirstOrDefaultAsync(m => m.Id == id);


        if (movie == null) return NotFound();

        return Ok(new MovieOutput
        {
            Id = movie.Id,
            Title = movie.Title,
            Type = movie.Type,
            Description = movie.Description,
            CoverUrl = movie.CoverUrl,
            Year = movie.Year,
            Categories = movie.MovieCategories
                .Select(mc => new MovieCategoryOutput
                {
                    Id = mc.Category.Id,
                    Name = mc.Category.Name
                })
                .OrderBy(c => c.Name)
                .ToList(),
            DurationMinutes = movie.DurationMinutes,
            SeasonsCount = movie.SeasonsCount,
            EpisodesCount = movie.EpisodesCount,
            Rating = movie.Ratings.Select(r => (double?)r.Score).Average() ?? 0,
            RatingCount = movie.Ratings.Count,
            LikesCount = movie.Likes.Count,
            LikedByMe = User.Identity?.IsAuthenticated == true
                && movie.Likes.Any(l => l.UserId == User.FindFirstValue(ClaimTypes.NameIdentifier)),


        });
    }


    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<MovieOutput>> Create([FromBody] CreateMovieInput input)
    {
        var movie = new Movie
        {
            Title = input.Title,
            Description = input.Description,
            CoverUrl = input.CoverUrl,
            Year = input.Year,
            Type = input.Type!.Value,

            DurationMinutes = input.DurationMinutes,
            SeasonsCount = input.SeasonsCount,
            EpisodesCount = input.EpisodesCount
        };


        _db.Movies.Add(movie);
        await _db.SaveChangesAsync();

        var result = new MovieOutput
        {
            Id = movie.Id,
            Title = movie.Title,
            Type = movie.Type,
            Description = movie.Description,
            CoverUrl = movie.CoverUrl,
            Year = movie.Year,
            DurationMinutes = movie.DurationMinutes,
            SeasonsCount = movie.SeasonsCount,
            EpisodesCount = movie.EpisodesCount,
            Rating = 0,
            RatingCount = 0,

            Categories = new()
        };


        return CreatedAtAction(nameof(GetById), new { id = movie.Id }, result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<MovieOutput>> Update(int id, [FromBody] UpdateMovieInput input)
    {
        var movie = await _db.Movies.FirstOrDefaultAsync(m => m.Id == id);
        if (movie == null) return NotFound();

        movie.Title = input.Title;
        movie.Description = input.Description;
        movie.CoverUrl = input.CoverUrl;
        movie.Year = input.Year;
        movie.Type = input.Type!.Value;

        movie.DurationMinutes = input.DurationMinutes;
        movie.SeasonsCount = input.SeasonsCount;
        movie.EpisodesCount = input.EpisodesCount;


        await _db.SaveChangesAsync();

        return Ok(new MovieOutput
        {
            Id = movie.Id,
            Title = movie.Title,
            Type = movie.Type,
            Description = movie.Description,
            CoverUrl = movie.CoverUrl,
            Year = movie.Year,
            DurationMinutes = movie.DurationMinutes,
            SeasonsCount = movie.SeasonsCount,
            EpisodesCount = movie.EpisodesCount,
            Rating = movie.Ratings.Select(r => (double?)r.Score).Average() ?? 0,
            RatingCount = movie.Ratings.Count,
            Categories = new()
        });

    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var movie = await _db.Movies.FirstOrDefaultAsync(m => m.Id == id);
        if (movie == null) return NotFound();

        _db.Movies.Remove(movie);
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [Authorize(Roles = "Admin")]
    [HttpPost("{movieId:int}/categories/{categoryId:int}")]
    public async Task<IActionResult> AddCategoryToMovie(int movieId, int categoryId)
    {
        var movieExists = await _db.Movies.AnyAsync(m => m.Id == movieId);
        if (!movieExists) return NotFound("Movie not found.");

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == categoryId);
        if (!categoryExists) return NotFound("Category not found.");

        var alreadyLinked = await _db.MovieCategories.AnyAsync(mc =>
            mc.MovieId == movieId && mc.CategoryId == categoryId);

        if (alreadyLinked) return Conflict("This category is already assigned to this movie.");

        _db.MovieCategories.Add(new MovieCategory
        {
            MovieId = movieId,
            CategoryId = categoryId
        });

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{movieId:int}/categories/{categoryId:int}")]
    public async Task<IActionResult> RemoveCategoryFromMovie(int movieId, int categoryId)
    {
        var link = await _db.MovieCategories
            .FirstOrDefaultAsync(mc => mc.MovieId == movieId && mc.CategoryId == categoryId);

        if (link is null) return NotFound("This category is not assigned to this movie.");

        _db.MovieCategories.Remove(link);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:int}")]
    public async Task<ActionResult<MovieOutput>> Patch(int id, [FromBody] PatchMovieInput input)
    {
        var movie = await _db.Movies.FirstOrDefaultAsync(m => m.Id == id);
        if (movie == null) return NotFound();

        if (input.Title is not null) movie.Title = input.Title;
        if (input.Description is not null) movie.Description = input.Description;
        if (input.CoverUrl is not null) movie.CoverUrl = input.CoverUrl;
        if (input.Year.HasValue) movie.Year = input.Year;
        if (input.Type.HasValue) movie.Type = input.Type.Value;
        if (input.DurationMinutes.HasValue) movie.DurationMinutes = input.DurationMinutes.Value;
        if (input.SeasonsCount.HasValue) movie.SeasonsCount = input.SeasonsCount.Value;
        if (input.EpisodesCount.HasValue) movie.EpisodesCount = input.EpisodesCount.Value;

        var errors = MovieTypeValidation.Validate(
            movie.Type,
            movie.DurationMinutes,
            movie.SeasonsCount,
            movie.EpisodesCount
        ).ToList();

        foreach (var e in errors)
        {
            var key = e.MemberNames.FirstOrDefault() ?? "";
            ModelState.AddModelError(key, e.ErrorMessage ?? "Validation error");
        }

        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);



        await _db.SaveChangesAsync();

        return Ok(new MovieOutput
        {
            Id = movie.Id,
            Title = movie.Title,
            Type = movie.Type,
            Description = movie.Description,
            CoverUrl = movie.CoverUrl,
            Year = movie.Year,
            Categories = new() 
        });
    }

    [Authorize]
    [HttpPost("{id:int}/ratings")]
    public async Task<IActionResult> Rate(int id, [FromBody] RateMovieInput input)
    {
        var movieExists = await _db.Movies.AnyAsync(m => m.Id == id);
        if (!movieExists) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var existing = await _db.Ratings
            .FirstOrDefaultAsync(r => r.MovieId == id && r.UserId == userId);

        if (existing is null)
        {
            _db.Ratings.Add(new Rating { MovieId = id, Score = input.Score, UserId = userId });
        }
        else
        {
            existing.Score = input.Score;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:int}/like")]
    public async Task<IActionResult> LikeMovie(int id)
    {
        var movieExists = await _db.Movies.AnyAsync(m => m.Id == id);
        if (!movieExists) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var exists = await _db.Likes.AnyAsync(l => l.MovieId == id && l.UserId == userId);
        if (exists) return NoContent();

        _db.Likes.Add(new Like { MovieId = id, UserId = userId });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("liked")]
    public async Task<ActionResult<PagedResult<MovieOutput>>> GetMyLiked(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 16
)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var countQuery = _db.Movies
            .Where(m => m.Likes.Any(l => l.UserId == userId));

        var totalCount = await countQuery.CountAsync();

        var query = _db.Movies
            .Include(m => m.MovieCategories).ThenInclude(mc => mc.Category)
            .Where(m => m.Likes.Any(l => l.UserId == userId))
            .OrderBy(m => m.Title)
            .Skip((page - 1) * pageSize)
            .Take(pageSize);

        var items = await query
            .Select(m => new MovieOutput
            {
                Id = m.Id,
                Title = m.Title,
                Type = m.Type,
                Description = m.Description,
                CoverUrl = m.CoverUrl,
                Year = m.Year,
                DurationMinutes = m.DurationMinutes,
                SeasonsCount = m.SeasonsCount,
                EpisodesCount = m.EpisodesCount,
                Rating = m.Ratings.Select(r => (double?)r.Score).Average() ?? 0,
                RatingCount = m.Ratings.Count,
                LikesCount = m.Likes.Count,
                LikedByMe = true,
                Categories = m.MovieCategories
                    .Select(mc => new MovieCategoryOutput { Id = mc.Category.Id, Name = mc.Category.Name })
                    .OrderBy(c => c.Name)
                    .ToList()
            })
            .ToListAsync();

        return Ok(new PagedResult<MovieOutput>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }


    [Authorize]
    [HttpDelete("{id:int}/like")]
    public async Task<IActionResult> UnlikeMovie(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var like = await _db.Likes.FirstOrDefaultAsync(l => l.MovieId == id && l.UserId == userId);
        if (like is null) return NoContent();

        _db.Likes.Remove(like);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id:int}/comments")]
    public async Task<ActionResult<List<CommentOutput>>> GetComments(int id)
    {
        var exists = await _db.Movies.AnyAsync(m => m.Id == id);
        if (!exists) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var items = await (
            from c in _db.Comments
            join u in _db.Users on c.UserId equals u.Id
            where c.MovieId == id
            orderby c.CreatedAt descending
            select new CommentOutput
            {
                Id = c.Id,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                UserId = c.UserId,
                UserName = u.UserName ?? u.Email ?? "",
                LikesCount = _db.CommentLikes.Count(cl => cl.CommentId == c.Id),
                LikedByMe = userId != null && _db.CommentLikes.Any(cl => cl.CommentId == c.Id && cl.UserId == userId),
                CanDelete = (userId != null && c.UserId == userId)  

            }
        ).ToListAsync();

        return Ok(items);
    }


    [Authorize]
    [HttpPost("{id:int}/comments")]
    public async Task<ActionResult<CommentOutput>> AddComment(int id, [FromBody] AddCommentInput input)
    {
        var movieExists = await _db.Movies.AnyAsync(m => m.Id == id);
        var userName = User.FindFirstValue(ClaimTypes.Name) ?? "";

        if (!movieExists) return NotFound();

        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var comment = new Comment { MovieId = id, UserId = userId, Text = input.Text };
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return Ok(new CommentOutput
        {
            Id = comment.Id,
            Text = comment.Text,
            CreatedAt = comment.CreatedAt,
            UserId = comment.UserId,
            UserName = userName,
            LikesCount = 0,
            LikedByMe = false,
            CanDelete = true,
        });

    }

    


    //[authorize(roles = "admin")]
    //[httpdelete("/api/comments/{commentid:int}")]
    //public async task<iactionresult> deletecomment(int commentid)
    //{
    //    var comment = await _db.comments.firstordefaultasync(c => c.id == commentid);
    //    if (comment is null) return notfound();

    //    _db.comments.remove(comment);
    //    await _db.savechangesasync();
    //    return nocontent();
    //}

    [Authorize]
    [HttpPost("/api/comments/{commentId:int}/like")]
    public async Task<IActionResult> LikeComment(int commentId)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var exists = await _db.Comments.AnyAsync(c => c.Id == commentId);
        if (!exists) return NotFound();

        var already = await _db.CommentLikes.AnyAsync(x => x.CommentId == commentId && x.UserId == userId);
        if (already) return NoContent();

        _db.CommentLikes.Add(new CommentLike { CommentId = commentId, UserId = userId });
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("/api/comments/{commentId:int}/like")]
    public async Task<IActionResult> UnlikeComment(int commentId)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var like = await _db.CommentLikes.FirstOrDefaultAsync(x => x.CommentId == commentId && x.UserId == userId);
        if (like is null) return NoContent();

        _db.CommentLikes.Remove(like);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("/api/comments/{commentId:int}")]
    public async Task<IActionResult> DeleteMyComment(int commentId)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == commentId);
        if (comment is null) return NotFound();

        if (comment.UserId != userId) return Forbid(); 

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("/api/comments/{commentId:int}/admin")]
    public async Task<IActionResult> DeleteCommentAdmin(int commentId)
    {
        var comment = await _db.Comments.FirstOrDefaultAsync(c => c.Id == commentId);
        if (comment is null) return NotFound();

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
        return NoContent();
    }


    [Authorize]
    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, [FromBody] SetWatchStatusInput input)
    {
        var movieExists = await _db.Movies.AnyAsync(m => m.Id == id);
        if (!movieExists) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var existing = await _db.UserMovieStatuses
            .FirstOrDefaultAsync(s => s.MovieId == id && s.UserId == userId);

        if (existing is null)
        {
            _db.UserMovieStatuses.Add(new UserMovieStatus
            {
                MovieId = id,
                UserId = userId,
                Status = input.Status
            });
        }
        else
        {
            existing.Status = input.Status;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("/api/me/statuses")]
    public async Task<ActionResult<List<object>>> MyStatuses()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var items = await _db.UserMovieStatuses
            .Where(s => s.UserId == userId)
            .Select(s => new { s.MovieId, s.Status, s.UpdatedAt })
            .ToListAsync();

        return Ok(items);
    }

    [Authorize]
    [HttpDelete("{id:int}/status")]
    public async Task<IActionResult> DeleteStatus(int id)
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var existing = await _db.UserMovieStatuses
            .FirstOrDefaultAsync(s => s.MovieId == id && s.UserId == userId);

        if (existing is null) return NoContent();

        _db.UserMovieStatuses.Remove(existing);
        await _db.SaveChangesAsync();
        return NoContent();
    }

}