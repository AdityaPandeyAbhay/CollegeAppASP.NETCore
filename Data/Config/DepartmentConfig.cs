using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class DepartmentConfig : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            // Table
            builder.ToTable("Departments");

            // Primary Key
            builder.HasKey(d => d.Id);

            builder.Property(d => d.Id)
                   .ValueGeneratedOnAdd();

            // Properties
            builder.Property(d => d.DepartmentCode)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.HasIndex(d => d.DepartmentCode)
                   .IsUnique();

            builder.Property(d => d.DepartmentName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasIndex(d => d.DepartmentName)
                   .IsUnique();

            builder.Property(d => d.Description)
                   .HasMaxLength(500);

            builder.Property(d => d.DisplayOrder)
                   .IsRequired();

            builder.Property(d => d.IsActive)
                   .HasDefaultValue(true);

            builder.Property(d => d.CreatedBy)
                   .HasMaxLength(450);

            builder.Property(d => d.CreatedDate)
                   .HasDefaultValueSql("GETDATE()");

            builder.Property(d => d.UpdatedBy)
                   .HasMaxLength(450);

            // Relationships

            builder.HasMany(d => d.Students)
                   .WithOne(s => s.Department)
                   .HasForeignKey(s => s.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(d => d.Teachers)
                   .WithOne(t => t.Department)
                   .HasForeignKey(t => t.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(d => d.SchoolClasses)
                   .WithOne(c => c.Department)
                   .HasForeignKey(c => c.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(d => d.Subjects)
                   .WithOne(s => s.Department)
                   .HasForeignKey(s => s.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Teacher Assignment Relationship

            builder.HasMany(d => d.TeacherAssignments)
                   .WithOne(t => t.Department)
                   .HasForeignKey(t => t.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Seed Data
            builder.HasData(
                new Department
                {
                    Id = 1,
                    DepartmentCode = "CSE",
                    DepartmentName = "Computer Science",
                    Description = "Department of Computer Science",
                    DisplayOrder = 1,
                    IsActive = true,
                    CreatedDate = new DateTime(2026, 1, 1)
                },
                new Department
                {
                    Id = 2,
                    DepartmentCode = "MAT",
                    DepartmentName = "Mathematics",
                    Description = "Department of Mathematics",
                    DisplayOrder = 2,
                    IsActive = true,
                    CreatedDate = new DateTime(2026, 1, 1)
                },
                new Department
                {
                    Id = 3,
                    DepartmentCode = "PHY",
                    DepartmentName = "Physics",
                    Description = "Department of Physics",
                    DisplayOrder = 3,
                    IsActive = true,
                    CreatedDate = new DateTime(2026, 1, 1)
                }
            );
        }
    }
}