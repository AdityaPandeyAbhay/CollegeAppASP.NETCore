using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNonTeachingStaffDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EducationFileName",
                table: "NonTeachingStaffs",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EducationPdf",
                table: "NonTeachingStaffs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FatherName",
                table: "NonTeachingStaffs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotherName",
                table: "NonTeachingStaffs",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Photo",
                table: "NonTeachingStaffs",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EducationFileName",
                table: "NonTeachingStaffs");

            migrationBuilder.DropColumn(
                name: "EducationPdf",
                table: "NonTeachingStaffs");

            migrationBuilder.DropColumn(
                name: "FatherName",
                table: "NonTeachingStaffs");

            migrationBuilder.DropColumn(
                name: "MotherName",
                table: "NonTeachingStaffs");

            migrationBuilder.DropColumn(
                name: "Photo",
                table: "NonTeachingStaffs");
        }
    }
}
