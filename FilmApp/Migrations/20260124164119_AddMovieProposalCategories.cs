using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FilmApp.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieProposalCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "MovieProposals",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "MovieProposalCategories",
                columns: table => new
                {
                    MovieProposalId = table.Column<int>(type: "int", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovieProposalCategories", x => new { x.MovieProposalId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_MovieProposalCategories_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MovieProposalCategories_MovieProposals_MovieProposalId",
                        column: x => x.MovieProposalId,
                        principalTable: "MovieProposals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MovieProposalCategories_CategoryId",
                table: "MovieProposalCategories",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MovieProposalCategories");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "MovieProposals");
        }
    }
}
