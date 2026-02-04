using FilmApp.Api.Controllers;
using FilmApp.Api.Data;
using FilmApp.Api.Dtos;
using FilmApp.Api.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Xunit;

namespace FilmApp.Tests;

public class MoviesControllerTests
{
    private static AppDbContext CreateDbContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        return new AppDbContext(options);
    }

    private static MoviesController CreateMoviesController(
        AppDbContext db,
        string? userId = null)
    {
        var controller = new MoviesController(db);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(new ClaimsIdentity(
                    new[] { new Claim(ClaimTypes.NameIdentifier, userId ?? "test") },
                    "TestAuth"))
            }
        };
        return controller;
    }

    [Fact]
    public async Task GetById_NotFound_WhenNoMovie()
    {
        using var db = CreateDbContext("GetById");
        var controller = CreateMoviesController(db);
        var result = await controller.GetById(999);
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_SavesMovie()
    {
        using var db = CreateDbContext("Create");
        var controller = CreateMoviesController(db);
        var input = new CreateMovieInput
        {
            Title = "Test Movie",
            Description = "Test",
            Year = 2020,
            Type = FilmApp.Api.ContentType.Movie,
            DurationMinutes = 120
        };

        var result = await controller.Create(input);
        Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Single(db.Movies);
        Assert.Equal("Test Movie", db.Movies.First().Title);
    }

    [Fact]
    public async Task RateMovie_AddsRating()
    {
        using var db = CreateDbContext("Rate");
        var movie = new Movie
        {
            Title = "Test Movie",
            Type = FilmApp.Api.ContentType.Movie,
            Year = 2020
        };
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        var controller = CreateMoviesController(db, "user1");
        var input = new RateMovieInput { Score = 8 };

        await controller.Rate(movie.Id, input);

        Assert.Single(db.Ratings);
        Assert.Equal(8, db.Ratings.First().Score);
        Assert.Equal(movie.Id, db.Ratings.First().MovieId);
        Assert.Equal("user1", db.Ratings.First().UserId);
    }

    [Fact]
    public async Task LikeMovie_AddsLike()
    {
        using var db = CreateDbContext("Like");
        var movie = new Movie
        {
            Title = "Test Movie",
            Type = FilmApp.Api.ContentType.Movie
        };
        db.Movies.Add(movie);
        await db.SaveChangesAsync();

        var controller = CreateMoviesController(db, "user1");

        await controller.LikeMovie(movie.Id);

        Assert.Single(db.Likes);
        Assert.Equal(movie.Id, db.Likes.First().MovieId);
        Assert.Equal("user1", db.Likes.First().UserId);
    }

}
