using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Entities;

public class Rating
{
    public int Id { get; set; }

    [Range(1, 10)]
    public int Score { get; set; }

    [MaxLength(450)]
    public string UserId { get; set; } = default!;

    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
}
