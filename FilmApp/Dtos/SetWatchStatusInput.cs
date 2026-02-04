using FilmApp.Api;
using FilmApp.Api.Entities;
using System.ComponentModel.DataAnnotations;

public class SetWatchStatusInput
{
    [Required]
    public WatchStatus Status { get; set; }
}
