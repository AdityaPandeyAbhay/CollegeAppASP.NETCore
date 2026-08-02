using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class SubjectConfig : IEntityTypeConfiguration<Subject>
    {
        public void Configure(EntityTypeBuilder<Subject> builder)
        {
            // Table Name
            builder.ToTable("Subjects");

            // Primary Key
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            // Properties
            builder.Property(x => x.SubjectCode)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.HasIndex(x => x.SubjectCode)
                   .IsUnique();

            builder.Property(x => x.SubjectName)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(x => x.Description)
                   .HasMaxLength(500);

            builder.Property(x => x.TheoryMarks)
                   .IsRequired();

            builder.Property(x => x.PracticalMarks)
                   .IsRequired();

            builder.Property(x => x.IsOptional)
                   .HasDefaultValue(false);

            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(450);

            builder.Property(x => x.CreatedDate)
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(450);

            // Department Relationship
            builder.HasOne(x => x.Department)
         .WithMany(d => d.Subjects)
         .HasForeignKey(x => x.DepartmentId)
         .OnDelete(DeleteBehavior.Restrict);

            // TeacherAssignment Relationship
            builder.HasMany(x => x.TeacherAssignments)
                   .WithOne(x => x.Subject)
                   .HasForeignKey(x => x.SubjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Check Constraints
            builder.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Subject_TheoryMarks",
                    "[TheoryMarks] >= 0");

                t.HasCheckConstraint(
                    "CK_Subject_PracticalMarks",
                    "[PracticalMarks] >= 0");
            });
        }
    }
}