using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class AcademicYearConfig : IEntityTypeConfiguration<AcademicYear>
    {
        public void Configure(EntityTypeBuilder<AcademicYear> builder)
        {
            // Table Name
            builder.ToTable("AcademicYears");

            // Primary Key
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            // Properties
            builder.Property(x => x.YearName)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.HasIndex(x => x.YearName)
                   .IsUnique();

            builder.Property(x => x.StartDate)
                   .IsRequired();

            builder.Property(x => x.EndDate)
                   .IsRequired();

            builder.Property(x => x.IsCurrent)
                   .HasDefaultValue(false);

            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(450);

            builder.Property(x => x.CreatedDate)
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(450);

            // Relationships

            builder.HasMany(x => x.TeacherAssignments)
                   .WithOne(x => x.AcademicYear)
                   .HasForeignKey(x => x.AcademicYearId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Check Constraint
            builder.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_AcademicYear_Start_End_Date",
                    "[StartDate] < [EndDate]");
            });
        }
    }
}