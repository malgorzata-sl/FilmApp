using System.ComponentModel.DataAnnotations;
using FilmApp.Api;


public record CreateMovieProposalDto(
    [Required, MaxLength(200)] string Title,
    [Required] int Year,
    [Required] ContentType Type,
    [Required, MinLength(1)] List<int> CategoryIds,
    [Required, MaxLength(2000)] string Reason
);
