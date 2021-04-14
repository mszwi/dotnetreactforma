using Microsoft.EntityFrameworkCore.Migrations;

namespace DotnetReactFoma.Migrations
{
    public partial class Adderusertocompetition : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "CompetitionEntries",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "CompetitionEntries",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompetitionEntries_UserId",
                table: "CompetitionEntries",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CompetitionEntries_AspNetUsers_UserId",
                table: "CompetitionEntries",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CompetitionEntries_AspNetUsers_UserId",
                table: "CompetitionEntries");

            migrationBuilder.DropIndex(
                name: "IX_CompetitionEntries_UserId",
                table: "CompetitionEntries");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "CompetitionEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "CompetitionEntries");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
