using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class SchoolClassConfig : IEntityTypeConfiguration<SchoolClass>
    {
        public void Configure(EntityTypeBuilder<SchoolClass> builder)
        {
            // Table
            builder.ToTable("Classes");

            // Primary Key
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Id)
                   .ValueGeneratedOnAdd();

            // Properties
            builder.Property(c => c.ClassCode)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(c => c.ClassName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(c => c.Description)
                   .HasMaxLength(500);

            builder.Property(c => c.DisplayOrder)
                   .IsRequired();

            builder.Property(c => c.IsActive)
                   .HasDefaultValue(true);

            builder.Property(c => c.CreatedBy)
                   .HasMaxLength(450);

            builder.Property(c => c.CreatedDate)
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(c => c.UpdatedBy)
                   .HasMaxLength(450);

            // Unique Indexes
            builder.HasIndex(c => c.ClassCode)
                   .IsUnique();

            builder.HasIndex(c => new
            {
                c.DepartmentId,
                c.ClassName
            })
            .IsUnique();

            // Relationships

            // Department (One Department -> Many Classes)
            builder.HasOne(c => c.Department)
                   .WithMany(d => d.SchoolClasses)
                   .HasForeignKey(c => c.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // SchoolClass -> Sections
            builder.HasMany(c => c.Sections)
                   .WithOne(s => s.SchoolClass)
                   .HasForeignKey(s => s.SchoolClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            // SchoolClass -> TeacherAssignments
            builder.HasMany(c => c.TeacherAssignments)
                   .WithOne(t => t.SchoolClass)
                   .HasForeignKey(t => t.SchoolClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Check Constraint
            builder.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_SchoolClass_DisplayOrder",
                    "[DisplayOrder] >= 1");
            });
        }
    }
}