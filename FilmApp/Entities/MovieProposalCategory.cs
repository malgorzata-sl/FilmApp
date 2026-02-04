using FilmApp.Api.Entities;

public class MovieProposalCategory
{
    public int MovieProposalId { get; set; }
    public MovieProposal MovieProposal { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
