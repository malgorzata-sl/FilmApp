using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Entities;

public class Comment
{
    public int Id { get; set; }
    public AppUser User { get; set; } = null!;


    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [Required]
    public int MovieId { get; set; }
    public Movie Movie { get; set; } = null!;
    [Required]
    public string UserId { get; set; } = default!;
    public List<CommentLike> Likes { get; set; } = new();

}
