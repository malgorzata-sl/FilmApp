using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Entities;

public class CommentLike
{
    public AppUser User { get; set; } = null!;

    public int Id { get; set; }

    public int CommentId { get; set; }
    public Comment Comment { get; set; } = null!;
    [Required]
    public string UserId { get; set; } = default!;
}
