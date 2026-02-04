namespace FilmApp.Api;

public enum CategoryFilterMode
{
    Any,
    Exact
}
public enum MovieSortBy { 
    Title, 
    Year,
    Type,
    Rating,
    RatingCount
}
public enum SortDirection { 
    Asc, 
    Desc 
}
public enum ContentType
{
    Movie = 0,
    Series = 1
}
public enum WatchStatus
{
    Watching = 1,
    WantToWatch = 2,
    Watched = 3
}
