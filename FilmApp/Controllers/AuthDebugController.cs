using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FilmApp.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthDebugController : ControllerBase
{
    [Authorize]
    [HttpGet("whoami")]
    public IActionResult WhoAmI()
        => Ok(new
        {
            Name = User.Identity?.Name,
            Roles = User.Claims
                .Where(c => c.Type.EndsWith("/claims/role"))
                .Select(c => c.Value)
        });
}
