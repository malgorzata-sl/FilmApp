using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Dtos;

public class UpdateMovieInput : IValidatableObject
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? CoverUrl { get; set; }

    public int? Year { get; set; }

    [Required]
    public ContentType? Type { get; set; }

    [Range(1, 1000)]
    public int? DurationMinutes { get; set; }

    [Range(1, 200)]
    public int? SeasonsCount { get; set; }

    [Range(1, 10000)]
    public int? EpisodesCount { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        => MovieTypeValidation.Validate(Type, DurationMinutes, SeasonsCount, EpisodesCount);
}
