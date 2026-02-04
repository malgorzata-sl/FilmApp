using FilmApp.Api.Data;
using FilmApp.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;


[ApiController]
[Route("api/[controller]")]
[Authorize] 
public class MovieProposalsController : ControllerBase
{
    private readonly AppDbContext _db;

    public MovieProposalsController(AppDbContext db) => _db = db;

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MovieProposalDto>> GetById(int id)
    {
        var proposal = await _db.MovieProposals
            .Include(p => p.Categories)
                .ThenInclude(pc => pc.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (proposal == null) return NotFound();

        var dto = new MovieProposalDto
        {
            Id = proposal.Id,
            Title = proposal.Title,
            Year = proposal.Year,
            Reason = proposal.Reason,
            Type = proposal.Type,
            Status = proposal.Status,
            CreatedAt = proposal.CreatedAt,
            UserId = proposal.UserId,
            Categories = proposal.Categories.Select(c => c.Category.Name).ToList()
        };

        return Ok(dto);
    }





    [HttpPost]
    public async Task<IActionResult> Create(CreateMovieProposalDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var distinctCategoryIds = dto.CategoryIds.Distinct().ToList();
        var existingCategories = await _db.Categories
            .Where(c => distinctCategoryIds.Contains(c.Id))
            .ToListAsync();

        var proposal = new MovieProposal
        {
            Title = dto.Title,
            Year = dto.Year,
            Type = dto.Type,
            Reason = dto.Reason,
            Status = ProposalStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _db.MovieProposals.Add(proposal);
        await _db.SaveChangesAsync();

        _db.MovieProposalCategories.AddRange(
            existingCategories.Select(cat => new MovieProposalCategory
            {
                MovieProposalId = proposal.Id,
                CategoryId = cat.Id
            })
        );

        await _db.SaveChangesAsync();

        var resultDto = new MovieProposalDto
        {
            Id = proposal.Id,
            Title = proposal.Title,
            Year = proposal.Year,
            Reason = proposal.Reason,
            Type = proposal.Type,
            Status = proposal.Status,
            CreatedAt = proposal.CreatedAt,
            UserId = proposal.UserId,
            Categories = existingCategories.Select(c => c.Name).ToList()
        };

        return CreatedAtAction(nameof(GetById), new { id = proposal.Id }, resultDto);
    }




    [HttpGet("mine")]
    public async Task<ActionResult<PagedResult<MovieProposal>>> Mine(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 50) pageSize = 50;

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null) return Unauthorized();

        var query = _db.MovieProposals
            .AsNoTracking()
            .Where(x => x.UserId == userId);

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


}
