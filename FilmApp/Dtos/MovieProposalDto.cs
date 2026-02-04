using FilmApp.Api.Entities;

namespace FilmApp.Api.Dtos;

public class MovieProposalDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }
    public string Reason { get; set; } = string.Empty;
    public ContentType Type { get; set; }
    public ProposalStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    public List<string> Categories { get; set; } = new();
}
