using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FilmApp.Api.Data; 
using System.Security.Claims;

[ApiController]
[Route("api/admin/reports")]
[Authorize(Roles = "Admin")]
public class AdminReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminReportsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("movies-ratings")]
    public async Task<ActionResult> MoviesRatings()
    {
        var data = await _db.Movies
            .AsNoTracking()
            .Where(m => m.Ratings.Any()) 
            .Select(m => new
            {
                name = m.Title,
                avgScore = m.Ratings.Average(r => (double?)r.Score) ?? 0,
                ratingCount = m.Ratings.Count()
            })
            .OrderByDescending(x => x.ratingCount)
            .Take(50) 
            .ToListAsync();

        return Ok(data);
    }

    [HttpGet("dashboard-metrics")]
    public async Task<ActionResult> DashboardMetrics()
    {
        var metrics = new
        {
            totalMovies = await _db.Movies.CountAsync(),
            newProposals = await _db.MovieProposals.CountAsync(p => p.Status == ProposalStatus.Pending),
            totalUsers = await _db.Users.CountAsync(), 
            totalRatings = await _db.Ratings.CountAsync()
        };

        return Ok(metrics);
    }

    [HttpGet("proposals-count-by-status")]
    public async Task<ActionResult> ProposalsCountByStatus()
    {
        var data = await _db.MovieProposals
            .GroupBy(p => p.Status)
            .Select(g => new { status = g.Key.ToString(), count = g.Count() })
            .ToDictionaryAsync(g => g.status, g => g.count);

        return Ok(data);
    }

    [HttpGet("admin-metrics")]
    public async Task<ActionResult<object>> AdminMetrics()
    {
        return Ok(new
        {
            totalMovies = await _db.Movies.CountAsync(),
            newProposals = await _db.MovieProposals.CountAsync(p => p.Status == ProposalStatus.Pending),
            totalUsers = await _db.Users.CountAsync(),
            totalRatings = await _db.Ratings.CountAsync() 
        });
    }


}
