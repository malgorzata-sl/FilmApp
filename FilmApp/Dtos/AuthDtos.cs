using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Dtos;

public class RegisterInput
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required, MinLength(6)]
    public string Password { get; set; } = "";
}

public class LoginInput
{
    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}

public class AuthOutput
{
    public string Token { get; set; } = "";
}
