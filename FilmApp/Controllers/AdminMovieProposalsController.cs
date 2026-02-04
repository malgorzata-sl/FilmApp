using FilmApp.Api.Data;
using FilmApp.Api.Dtos;
using FilmApp.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Microsoft.AspNetCore.Authorization;




namespace FilmApp.Api.Controllers;


[ApiController]
[Route("api/admin/movie-proposals")]
[Authorize(Roles = "Admin")]
public class AdminMovieProposalsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AdminMovieProposalsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<PagedResult<MovieProposal>>> GetAll(
    [FromQuery] ProposalStatus? status,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 20;
        if (pageSize > 100) pageSize = 100;

        var query = _db.MovieProposals.AsNoTracking().AsQueryable();

        if (status is not null)
            query = query.Where(x => x.Status == status);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new PagedResult<MovieProposal>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpPost("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var p = await _db.MovieProposals
            .Include(x => x.Categories)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (p is null) return NotFound();

        if (p.Status != ProposalStatus.Pending)
            return Conflict("Only pending proposals can be approved.");

        if (!Enum.IsDefined(typeof(ContentType), p.Type))
            return BadRequest("Invalid content type.");

        if (p.Year < 1888 || p.Year > 2100)
            return BadRequest("Invalid year.");

        var exists = await _db.Movies.AnyAsync(m => m.Title == p.Title && m.Year == p.Year);
        if (exists)
            return Conflict("Movie with this title and year already exists.");

        var movie = new Movie
        {
            Title = p.Title,
            Year = p.Year,
            Type = p.Type,        
            Description = null,    
            CoverUrl = null
        };

        _db.Movies.Add(movie);
        await _db.SaveChangesAsync(); 

        if (p.Categories.Count > 0)
        {
            _db.MovieCategories.AddRange(
                p.Categories.Select(pc => new MovieCategory
                {
                    MovieId = movie.Id,
                    CategoryId = pc.CategoryId
                })
            );
        }

        p.Status = ProposalStatus.Approved;
        await _db.SaveChangesAsync();

        return NoContent();
    }


    [HttpPost("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var p = await _db.MovieProposals.FindAsync(id);
        if (p is null) return NotFound();

        if (p.Status != ProposalStatus.Pending)
            return Conflict("Only pending proposals can be rejected."); 

        p.Status = ProposalStatus.Rejected;
        await _db.SaveChangesAsync();
        return NoContent();
    }

}
