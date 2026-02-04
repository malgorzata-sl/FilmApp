using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Entities;

public class Movie
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? CoverUrl { get; set; }

    public int? Year { get; set; }
    public int? DurationMinutes { get; set; }   

    public int? SeasonsCount { get; set; }      
    public int? EpisodesCount { get; set; }    
    public List<UserMovieStatus> UserStatuses { get; set; } = new();


    public List<MovieCategory> MovieCategories { get; set; } = new();

    public ContentType Type { get; set; }

    public List<Rating> Ratings { get; set; } = new();

    public List<Like> Likes { get; set; } = new();
    public List<Comment> Comments { get; set; } = new();
    




}
