using System.ComponentModel.DataAnnotations;

public class AddCommentInput
{
    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = "";
}
