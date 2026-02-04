using FilmApp.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FilmApp.Api.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db, IServiceProvider services)
    {

        if (!db.Categories.Any())
        {
            db.Categories.AddRange(
                new Category { Name = "Sci-Fi" },
                new Category { Name = "Dramat" },
                new Category { Name = "Akcja" },
                new Category { Name = "Komedia" },
                new Category { Name = "Drama" },
                new Category { Name = "Romans" },
                new Category { Name = "Anime" },
                new Category { Name = "Horror" },
                new Category { Name = "Thriller" }
            );
            db.SaveChanges();
        }

        if (!db.Movies.Any())
        {
            var inception = new Movie
            {
                Title = "Incepcja",
                Year = 2010,
                CoverUrl = "/covers/incepcja.jpg",
                Description = "Thriller sci-fi.",
                Type = ContentType.Movie,
                DurationMinutes = 148
            };

            var matrix = new Movie
            {
                Title = "Matrix",
                Year = 1999,
                CoverUrl = "/covers/matrix.jpg",
                Description = "Klasyczne sci-fi.",
                Type = ContentType.Movie,
                DurationMinutes = 136
            };

            var godfather = new Movie
            {
                Title = "Ojciec chrzestny",
                Year = 1972,
                CoverUrl = "/covers/godfather.jpg",
                Description = "Gangsterski klasyk.",
                Type = ContentType.Movie,
                DurationMinutes = 175
            };

            var breakingBad = new Movie
            {
                Title = "Breaking Bad",
                Year = 2008,
                CoverUrl = "/covers/breakingbad.jpg",
                Description = "Serial kryminalny.",
                Type = ContentType.Series,
                SeasonsCount = 5,
                EpisodesCount = 62
            };

            db.Movies.AddRange(inception, matrix, godfather, breakingBad);
            db.SaveChanges();

            var sciFi = db.Categories.First(c => c.Name == "Sci-Fi");
            var thriller = db.Categories.First(c => c.Name == "Thriller");
            var dramat = db.Categories.First(c => c.Name == "Dramat");

            db.MovieCategories.AddRange(
                new MovieCategory { MovieId = inception.Id, CategoryId = sciFi.Id },
                new MovieCategory { MovieId = inception.Id, CategoryId = thriller.Id },
                new MovieCategory { MovieId = matrix.Id, CategoryId = sciFi.Id },
                new MovieCategory { MovieId = godfather.Id, CategoryId = dramat.Id }
            );

            db.SaveChanges();
        }

        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var admin = userManager.FindByEmailAsync("admin@filmapp.local").GetAwaiter().GetResult();
        if (admin is null)
            return;

        var movieA = db.Movies.OrderBy(m => m.Id).First();
        var movieB = db.Movies.OrderBy(m => m.Id).Skip(1).First();

        var ratingExistsA = db.Ratings.Any(r => r.UserId == admin.Id && r.MovieId == movieA.Id);
        if (!ratingExistsA)
            db.Ratings.Add(new Rating { UserId = admin.Id, MovieId = movieA.Id, Score = 9 });

        var ratingExistsB = db.Ratings.Any(r => r.UserId == admin.Id && r.MovieId == movieB.Id);
        if (!ratingExistsB)
            db.Ratings.Add(new Rating { UserId = admin.Id, MovieId = movieB.Id, Score = 8 });

        var commentText = "Seed comment (admin).";
        var commentExists = db.Comments.Any(c => c.UserId == admin.Id && c.MovieId == movieA.Id && c.Text == commentText);
        if (!commentExists)
        {
            db.Comments.Add(new Comment
            {
                UserId = admin.Id,
                MovieId = movieA.Id,
                Text = commentText,
                CreatedAt = DateTime.UtcNow
            });
        }

        db.SaveChanges();
    }
}
