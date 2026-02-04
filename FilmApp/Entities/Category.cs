using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Entities;

public class Category
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public List<MovieCategory> MovieCategories { get; set; } = new();
}
