using FilmApp.Api;

public record MyMovieStatusRow(int MovieId, string Title, WatchStatus Status, DateTime UpdatedAt);
