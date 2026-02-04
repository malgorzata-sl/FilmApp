namespace FilmApp.Api.Dtos;

public class MovieOutput
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverUrl { get; set; }
    public int? Year { get; set; }
    public double Rating { get; set; }     
    public int RatingCount { get; set; }
    public List<MovieCategoryOutput> Categories { get; set; } = new();
    public ContentType Type { get; set; }
    public int? DurationMinutes { get; set; }
    public int? SeasonsCount { get; set; }
    public int? EpisodesCount { get; set; }
    public int LikesCount { get; set; }
    public bool LikedByMe { get; set; }
    public WatchStatus? MyStatus { get; set; }


}
