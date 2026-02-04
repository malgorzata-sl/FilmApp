using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Entities;

public class UserMovieStatus
{
    public int Id { get; set; }
    [Required]
    [MaxLength(450)]
    public string UserId { get; set; } = default!;
    [Required]
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;

    public WatchStatus Status { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
