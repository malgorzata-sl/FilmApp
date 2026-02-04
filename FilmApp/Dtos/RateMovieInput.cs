using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Dtos;

public class RateMovieInput
{
    [Range(1, 10)]
    public int Score { get; set; }

    public string UserName { get; set; } = "anonymous";

}
