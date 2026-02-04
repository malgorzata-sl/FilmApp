using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Dtos;

public class CreateCategoryInput
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
}
