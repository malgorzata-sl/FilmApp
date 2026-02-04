using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilmApp.Migrations
{
    /// <inheritdoc />
    public partial class FixRatingMovieCategoryRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ratings_MovieCategories_MovieCategoryMovieId_MovieCategoryCategoryId",
                table: "Ratings");

            migrationBuilder.DropIndex(
                name: "IX_Ratings_MovieCategoryMovieId_MovieCategoryCategoryId",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "MovieCategoryCategoryId",
                table: "Ratings");

            migrationBuilder.DropColumn(
                name: "MovieCategoryMovieId",
                table: "Ratings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MovieCategoryCategoryId",
                table: "Ratings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MovieCategoryMovieId",
                table: "Ratings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Ratings_MovieCategoryMovieId_MovieCategoryCategoryId",
                table: "Ratings",
                columns: new[] { "MovieCategoryMovieId", "MovieCategoryCategoryId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Ratings_MovieCategories_MovieCategoryMovieId_MovieCategoryCategoryId",
                table: "Ratings",
                columns: new[] { "MovieCategoryMovieId", "MovieCategoryCategoryId" },
                principalTable: "MovieCategories",
                principalColumns: new[] { "MovieId", "CategoryId" });
        }
    }
}
