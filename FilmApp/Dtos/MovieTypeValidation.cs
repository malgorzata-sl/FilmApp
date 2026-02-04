using System.ComponentModel.DataAnnotations;

namespace FilmApp.Api.Dtos;

public static class MovieTypeValidation
{
    public static IEnumerable<ValidationResult> Validate(
        ContentType? type,
        int? durationMinutes,
        int? seasonsCount,
        int? episodesCount)
    {
        if (type is null)
            yield break;

        if (type == ContentType.Movie)
        {
            if (durationMinutes is null)
                yield return new ValidationResult("DurationMinutes jest wymagane dla filmu.", new[] { "DurationMinutes" });

            if (seasonsCount is not null)
                yield return new ValidationResult("SeasonsCount nie może być ustawione dla filmu.", new[] { "SeasonsCount" });

            if (episodesCount is not null)
                yield return new ValidationResult("EpisodesCount nie może być ustawione dla filmu.", new[] { "EpisodesCount" });
        }
        else if (type == ContentType.Series)
        {
            if (seasonsCount is null)
                yield return new ValidationResult("SeasonsCount jest wymagane dla serialu.", new[] { "SeasonsCount" });

            if (episodesCount is null)
                yield return new ValidationResult("EpisodesCount jest wymagane dla serialu.", new[] { "EpisodesCount" });

            if (durationMinutes is not null)
                yield return new ValidationResult("DurationMinutes nie może być ustawione dla serialu.", new[] { "DurationMinutes" });
        }
    }
}
