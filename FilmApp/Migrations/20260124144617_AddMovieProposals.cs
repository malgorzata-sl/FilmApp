using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilmApp.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieProposals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Comments",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateTable(
                name: "MovieProposals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovieProposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovieProposals_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.AddCheckConstraint(
                name: "CK_Ratings_Score",
                table: "Ratings",
                sql: "[Score] >= 1 AND [Score] <= 10");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movies_Duration",
                table: "Movies",
                sql: "[DurationMinutes] IS NULL OR ([DurationMinutes] > 0 AND [DurationMinutes] <= 10000)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movies_Episodes",
                table: "Movies",
                sql: "[EpisodesCount] IS NULL OR [EpisodesCount] > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movies_Seasons",
                table: "Movies",
                sql: "[SeasonsCount] IS NULL OR [SeasonsCount] > 0");

            // ... CK_Movies_Seasons zostaje jak masz

            migrationBuilder.Sql("""
                UPDATE Movies
                SET [Year] = NULL
                WHERE [Year] IS NOT NULL AND ([Year] < 1888 OR [Year] > 2100);
                """);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Movies_Year",
                table: "Movies",
                sql: "[Year] IS NULL OR ([Year] >= 1888 AND [Year] <= 2100)");

            migrationBuilder.CreateIndex(
                name: "IX_Comments_UserId",
                table: "Comments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MovieProposals_UserId",
                table: "MovieProposals",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CommentLikes_AspNetUsers_UserId",
                table: "CommentLikes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_AspNetUsers_UserId",
                table: "Comments",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.NoAction);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CommentLikes_AspNetUsers_UserId",
                table: "CommentLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_Comments_AspNetUsers_UserId",
                table: "Comments");

            migrationBuilder.DropTable(
                name: "MovieProposals");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Ratings_Score",
                table: "Ratings");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movies_Duration",
                table: "Movies");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movies_Episodes",
                table: "Movies");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movies_Seasons",
                table: "Movies");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Movies_Year",
                table: "Movies");

            migrationBuilder.DropIndex(
                name: "IX_Comments_UserId",
                table: "Comments");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "Comments",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
