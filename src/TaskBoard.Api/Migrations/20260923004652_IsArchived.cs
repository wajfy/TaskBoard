using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskBoard.Api.Migrations
{
    /// <inheritdoc />
    public partial class IsArchived : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "isArchived",
                table: "Projects",
                newName: "IsArchived");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsArchived",
                table: "Projects",
                newName: "isArchived");
        }
    }
}
