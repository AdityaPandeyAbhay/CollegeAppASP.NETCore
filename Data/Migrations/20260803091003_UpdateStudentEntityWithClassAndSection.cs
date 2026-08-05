using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStudentEntityWithClassAndSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SchoolClassId",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SectionId",
                table: "Students",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Students_SchoolClassId_SectionId",
                table: "Students",
                columns: new[] { "SchoolClassId", "SectionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Students_SectionId",
                table: "Students",
                column: "SectionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Students_Classes_SchoolClassId",
                table: "Students",
                column: "SchoolClassId",
                principalTable: "Classes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Students_Sections_SectionId",
                table: "Students",
                column: "SectionId",
                principalTable: "Sections",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Students_Classes_SchoolClassId",
                table: "Students");

            migrationBuilder.DropForeignKey(
                name: "FK_Students_Sections_SectionId",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Students_SchoolClassId_SectionId",
                table: "Students");

            migrationBuilder.DropIndex(
                name: "IX_Students_SectionId",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SchoolClassId",
                table: "Students");

            migrationBuilder.DropColumn(
                name: "SectionId",
                table: "Students");
        }
    }
}
