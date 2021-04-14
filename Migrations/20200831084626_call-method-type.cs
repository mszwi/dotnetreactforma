using Microsoft.EntityFrameworkCore.Migrations;

namespace DotnetReactFoma.Migrations
{
    public partial class callmethodtype : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CallType",
                table: "CallLogs",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CallType",
                table: "CallLogs");
        }
    }
}
