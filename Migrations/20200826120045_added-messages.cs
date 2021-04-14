using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DotnetReactFoma.Migrations
{
    public partial class addedmessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MessaId",
                table: "CompetitionEntries",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CallLogs",
                columns: table => new
                {
                    CallLogId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessaId = table.Column<int>(nullable: false),
                    EventTime = table.Column<DateTime>(nullable: false),
                    EventType = table.Column<int>(nullable: false),
                    AdminId = table.Column<string>(nullable: true),
                    UserId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CallLogs", x => x.CallLogId);
                    table.ForeignKey(
                        name: "FK_CallLogs_AspNetUsers_AdminId",
                        column: x => x.AdminId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CallLogs_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ConnectionLogs",
                columns: table => new
                {
                    ConnectionLogId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessaId = table.Column<int>(nullable: false),
                    EventTime = table.Column<DateTime>(nullable: false),
                    EventType = table.Column<int>(nullable: false),
                    UserIdentifierId = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConnectionLogs", x => x.ConnectionLogId);
                    table.ForeignKey(
                        name: "FK_ConnectionLogs_AspNetUsers_UserIdentifierId",
                        column: x => x.UserIdentifierId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    MessageId = table.Column<string>(nullable: false),
                    Content = table.Column<string>(nullable: true),
                    FromId = table.Column<string>(nullable: true),
                    ToId = table.Column<string>(nullable: true),
                    Date = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.MessageId);
                    table.ForeignKey(
                        name: "FK_Messages_AspNetUsers_FromId",
                        column: x => x.FromId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Messages_AspNetUsers_ToId",
                        column: x => x.ToId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_AdminId",
                table: "CallLogs",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_CallLogs_UserId",
                table: "CallLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ConnectionLogs_UserIdentifierId",
                table: "ConnectionLogs",
                column: "UserIdentifierId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_FromId",
                table: "Messages",
                column: "FromId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ToId",
                table: "Messages",
                column: "ToId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CallLogs");

            migrationBuilder.DropTable(
                name: "ConnectionLogs");

            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropColumn(
                name: "MessaId",
                table: "CompetitionEntries");
        }
    }
}
