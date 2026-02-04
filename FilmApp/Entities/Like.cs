using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Entities;

public class Like
{
    public int Id { get; set; }
    [Required]
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    [Required]
    [MaxLength(450)]
    public string UserId { get; set; } = default!;
}
