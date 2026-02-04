using FilmApp.Api.Controllers;
using FilmApp.Api.Data;
using FilmApp.Api.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FilmApp.Tests;

public static class TestHelper
{
    public static AppDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new AppDbContext(options);
    }

    public static MoviesController CreateMoviesController(
        AppDbContext db,
        string? userId = null,
        string? userName = "test_user",
        bool isAuthenticated = true)
    {
        var controller = new MoviesController(db);

        var claims = new List<Claim>();
        if (userId != null)
            claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
        if (userName != null)
            claims.Add(new Claim(ClaimTypes.Name, userName));

        var identity = new ClaimsIdentity(
            isAuthenticated ? claims : Enumerable.Empty<Claim>(),
            isAuthenticated ? "TestAuth" : null);

        var principal = new ClaimsPrincipal(identity);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = principal
            }
        };

        return controller;
    }
}
