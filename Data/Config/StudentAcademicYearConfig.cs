using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class StudentAcademicYearConfig : IEntityTypeConfiguration<StudentAcademicYear>
    {
        public void Configure(EntityTypeBuilder<StudentAcademicYear> builder)
        {
            builder.ToTable("StudentAcademicYears");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.RollNumber)
                   .HasMaxLength(50);

            builder.Property(x => x.Status)
                   .HasMaxLength(50)
                   .HasDefaultValue("Active");

            builder.Property(x => x.IsPromoted)
                   .HasDefaultValue(false);

            builder.Property(x => x.EnrollmentDate)
                   .IsRequired();

            builder.Property(x => x.Remarks)
                   .HasMaxLength(500);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(450)
                   .IsRequired();

            builder.Property(x => x.CreatedDate)
                   .IsRequired();

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(450);

            // Relationships
            builder.HasOne(x => x.Student)
                   .WithMany(s => s.StudentAcademicYears)
                   .HasForeignKey(x => x.StudentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.AcademicYear)
                   .WithMany(a => a.StudentAcademicYears)
                   .HasForeignKey(x => x.AcademicYearId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Department)
                   .WithMany()
                   .HasForeignKey(x => x.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.SchoolClass)
                   .WithMany(c => c.StudentAcademicYears)
                   .HasForeignKey(x => x.SchoolClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Section)
                   .WithMany(s => s.StudentAcademicYears)
                   .HasForeignKey(x => x.SectionId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Unique index per student per academic year
            builder.HasIndex(x => new
            {
                x.StudentId,
                x.AcademicYearId
            })
            .IsUnique();
        }
    }
}
