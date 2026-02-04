using FilmApp.Api.Data;
using FilmApp.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace FilmApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _db;

    public CategoriesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryOutput>>> GetAll()
    {
        var items = await _db.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryOutput { Id = c.Id, Name = c.Name })
            .ToListAsync();

        return Ok(items);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<CategoryOutput>> Create([FromBody] CreateCategoryInput input)
    {
        var categoryExists = await _db.Categories.AnyAsync(c => c.Name == input.Name);
        if (categoryExists) return Conflict("Category with this name already exists.");

        var category = new Entities.Category { Name = input.Name };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return Ok(new CategoryOutput { Id = category.Id, Name = category.Name });
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryOutput>> Update(int id, [FromBody] CreateCategoryInput input)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null) return NotFound();

        var nameExists = await _db.Categories.AnyAsync(c => c.Id != id && c.Name == input.Name);
        if (nameExists) return Conflict("Category with this name already exists.");

        category.Name = input.Name;
        await _db.SaveChangesAsync();

        return Ok(new CategoryOutput { Id = category.Id, Name = category.Name });
    }



    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null) return NotFound();

        var links = await _db.MovieCategories
            .Where(mc => mc.CategoryId == id)
            .ToListAsync();

        if (links.Count > 0)
            _db.MovieCategories.RemoveRange(links);

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        return NoContent();
    }


}
