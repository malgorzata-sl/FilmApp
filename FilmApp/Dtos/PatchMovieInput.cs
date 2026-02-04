using FilmApp.Api;

namespace FilmApp.Api.Dtos;

public class PatchMovieInput
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? CoverUrl { get; set; }
    public int? Year { get; set; }
    public ContentType? Type { get; set; }
    public int? DurationMinutes { get; set; }
    public int? SeasonsCount { get; set; }
    public int? EpisodesCount { get; set; }

}
