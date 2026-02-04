public class CommentOutput
{
    public int Id { get; set; }
    public string Text { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public string UserId { get; set; } = "";

    public string UserName { get; set; } = "";

    public int LikesCount { get; set; }
    public bool LikedByMe { get; set; }
    public bool CanDelete { get; set; }
}
