using FilmApp.Api.Dtos;
using FilmApp.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FilmApp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    private readonly IConfiguration _config;

    public AuthController(UserManager<AppUser> users, IConfiguration config)
    {
        _users = users;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterInput input)
    {
        var existing = await _users.FindByEmailAsync(input.Email);
        if (existing is not null) return Conflict("User already exists.");

        var user = new AppUser { UserName = input.Email, Email = input.Email };
        var result = await _users.CreateAsync(user, input.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _users.AddToRoleAsync(user, "User");
        return NoContent();
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthOutput>> Login([FromBody] LoginInput input)
    {
        var user = await _users.FindByEmailAsync(input.Email);
        if (user is null) return Unauthorized();

        var ok = await _users.CheckPasswordAsync(user, input.Password);
        if (!ok) return Unauthorized();

        var roles = await _users.GetRolesAsync(user);

        var jwt = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? "")
        };

        foreach (var r in roles)
            claims.Add(new Claim(ClaimTypes.Role, r));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return Ok(new AuthOutput { Token = new JwtSecurityTokenHandler().WriteToken(token) });
    }
}
