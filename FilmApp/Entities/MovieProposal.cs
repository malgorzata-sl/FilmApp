using FilmApp.Api.Entities;
using FilmApp.Api;


public enum ProposalStatus { Pending = 0, Approved = 1, Rejected = 2 }

public class MovieProposal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Year { get; set; }                
    public string Reason { get; set; } = string.Empty;
    public ContentType Type { get; set; }


    public ProposalStatus Status { get; set; } = ProposalStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = default!;
    public AppUser User { get; set; } = null!;
    public List<MovieProposalCategory> Categories { get; set; } = new();
}
