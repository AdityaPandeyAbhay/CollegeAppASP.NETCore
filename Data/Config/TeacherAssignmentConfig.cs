using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class TeacherAssignmentConfig : IEntityTypeConfiguration<TeacherAssignment>
    {
        public void Configure(EntityTypeBuilder<TeacherAssignment> builder)
        {
            builder.ToTable("TeacherAssignments");


            // Primary Key
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();


            // Properties

            builder.Property(x => x.IsClassTeacher)
                   .IsRequired();

            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(450)
                   .IsRequired();

            builder.Property(x => x.CreatedDate)
                   .IsRequired();

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(450);



            // =========================
            // Relationships
            // =========================


            // Teacher
            builder.HasOne(x => x.Teacher)
                   .WithMany(t => t.TeacherAssignments)
                   .HasForeignKey(x => x.TeacherId)
                   .OnDelete(DeleteBehavior.Restrict);



            // Department
            builder.HasOne(x => x.Department)
                   .WithMany(d => d.TeacherAssignments)
                   .HasForeignKey(x => x.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);



            // School Class
            builder.HasOne(x => x.SchoolClass)
                   .WithMany(c => c.TeacherAssignments)
                   .HasForeignKey(x => x.SchoolClassId)
                   .OnDelete(DeleteBehavior.Restrict);



            // Section
            builder.HasOne(x => x.Section)
                   .WithMany(s => s.TeacherAssignments)
                   .HasForeignKey(x => x.SectionId)
                   .OnDelete(DeleteBehavior.Restrict);



            // Subject
            builder.HasOne(x => x.Subject)
                   .WithMany(s => s.TeacherAssignments)
                   .HasForeignKey(x => x.SubjectId)
                   .OnDelete(DeleteBehavior.Restrict);



            // Academic Year
            builder.HasOne(x => x.AcademicYear)
                   .WithMany(a => a.TeacherAssignments)
                   .HasForeignKey(x => x.AcademicYearId)
                   .OnDelete(DeleteBehavior.Restrict);



            // Composite Unique Index
            builder.HasIndex(x => new
            {
                x.TeacherId,
                x.DepartmentId,
                x.SchoolClassId,
                x.SectionId,
                x.SubjectId,
                x.AcademicYearId

            })
            .IsUnique();
        }
    }
}