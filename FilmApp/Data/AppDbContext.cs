using FilmApp.Api.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FilmApp.Api.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<MovieCategory> MovieCategories => Set<MovieCategory>();
    public DbSet<Rating> Ratings => Set<Rating>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<CommentLike> CommentLikes => Set<CommentLike>();
    public DbSet<UserMovieStatus> UserMovieStatuses => Set<UserMovieStatus>();
    public DbSet<MovieProposal> MovieProposals => Set<MovieProposal>();
    public DbSet<MovieProposalCategory> MovieProposalCategories => Set<MovieProposalCategory>();




    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); 

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Name)
            .IsUnique();

        modelBuilder.Entity<Movie>().HasIndex(m => m.Title);
        modelBuilder.Entity<Movie>().HasIndex(m => m.Year);
        modelBuilder.Entity<Movie>().HasIndex(m => m.Type);

        // Relacja N:M Movies
        modelBuilder.Entity<MovieCategory>()
            .HasKey(mc => new { mc.MovieId, mc.CategoryId });

        modelBuilder.Entity<MovieCategory>()
            .HasOne(mc => mc.Movie)
            .WithMany(m => m.MovieCategories)
            .HasForeignKey(mc => mc.MovieId);

        modelBuilder.Entity<MovieCategory>()
            .HasOne(mc => mc.Category)
            .WithMany(c => c.MovieCategories)
            .HasForeignKey(mc => mc.CategoryId);

        modelBuilder.Entity<Rating>()
            .HasIndex(r => new { r.UserId, r.MovieId })
            .IsUnique();

        modelBuilder.Entity<Like>()
            .HasIndex(l => new { l.UserId, l.MovieId })
            .IsUnique();
        modelBuilder.Entity<CommentLike>()
            .HasIndex(cl => new { cl.UserId, cl.CommentId })
            .IsUnique();

        modelBuilder.Entity<Comment>()
            .HasIndex(c => new { c.MovieId, c.CreatedAt });
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany() 
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.NoAction); 


        modelBuilder.Entity<UserMovieStatus>()
            .HasIndex(s => new { s.UserId, s.MovieId })
            .IsUnique();
        modelBuilder.Entity<Rating>()
            .ToTable(t => t.HasCheckConstraint("CK_Ratings_Score", "[Score] >= 1 AND [Score] <= 10"));
        // Walidacja biznesowa
        modelBuilder.Entity<Movie>()
            .ToTable(t =>
            {
                t.HasCheckConstraint("CK_Movies_Year", "[Year] IS NULL OR ([Year] >= 1888 AND [Year] <= 2100)");
                t.HasCheckConstraint("CK_Movies_Duration", "[DurationMinutes] IS NULL OR ([DurationMinutes] > 0 AND [DurationMinutes] <= 10000)");
                t.HasCheckConstraint("CK_Movies_Episodes", "[EpisodesCount] IS NULL OR [EpisodesCount] > 0");
                t.HasCheckConstraint("CK_Movies_Seasons", "[SeasonsCount] IS NULL OR [SeasonsCount] > 0");
            });

        modelBuilder.Entity<MovieProposalCategory>()
            .HasKey(x => new { x.MovieProposalId, x.CategoryId });

        modelBuilder.Entity<MovieProposalCategory>()
            .HasOne(x => x.MovieProposal)
            .WithMany(p => p.Categories)
            .HasForeignKey(x => x.MovieProposalId);

        modelBuilder.Entity<MovieProposalCategory>()
            .HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId);

    }
}
