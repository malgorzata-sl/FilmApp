using FilmApp.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FilmApp.Api.Controllers;

public record MyLikedMovieRow(int Id, string Title);
public record MyMovieStatusRow(int MovieId, string Title, WatchStatus Status, DateTime UpdatedAt);

[ApiController]
[Route("api/me/reports")]
[Authorize]
public class MeReportsController : ControllerBase
{
    private readonly AppDbContext _db;
    public MeReportsController(AppDbContext db) => _db = db;

    [HttpGet("liked-movies")]
    public async Task<ActionResult<List<MyLikedMovieRow>>> LikedMovies()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        return Ok(await _db.Movies
            .AsNoTracking()
            .Where(m => m.Likes.Any(l => l.UserId == userId))
            .OrderBy(m => m.Title)
            .Select(m => new MyLikedMovieRow(m.Id, m.Title))
            .ToListAsync());
    }

    [HttpGet("movie-statuses")]
    public async Task<ActionResult<List<MyMovieStatusRow>>> MovieStatuses()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        return Ok(await _db.UserMovieStatuses
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.UpdatedAt)
            .Select(s => new MyMovieStatusRow(s.MovieId, s.Movie.Title, s.Status, s.UpdatedAt))
            .ToListAsync());
    }
[HttpGet("user-metrics")]
public async Task<ActionResult<object>> UserMetrics()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    
    return Ok(new
    {
        likedMovies = await _db.Movies.CountAsync(m => m.Likes.Any(l => l.UserId == userId)),
        watchedMovies = await _db.UserMovieStatuses.CountAsync(s => s.UserId == userId && s.Status == WatchStatus.Watched),
        proposalsCount = await _db.MovieProposals.CountAsync(p => p.UserId == userId)
    });
}

}
