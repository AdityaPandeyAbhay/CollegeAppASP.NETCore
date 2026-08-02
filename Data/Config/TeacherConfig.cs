using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class TeacherConfig : IEntityTypeConfiguration<Teacher>
    {
        public void Configure(EntityTypeBuilder<Teacher> builder)
        {
            // Table
            builder.ToTable("Teachers");

            // Primary Key
            builder.HasKey(t => t.Id);

            builder.Property(t => t.Id)
                   .ValueGeneratedOnAdd();

            //==========================
            // Properties
            //==========================

            builder.Property(t => t.UserId)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.Property(t => t.TeacherCode)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.HasIndex(t => t.UserId)
                   .IsUnique();

            builder.HasIndex(t => t.TeacherCode)
                   .IsUnique();

            builder.Property(t => t.FirstName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(t => t.MiddleName)
                   .HasMaxLength(100);

            builder.Property(t => t.LastName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(t => t.Gender)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(t => t.Email)
                   .IsRequired()
                   .HasMaxLength(250);

            builder.HasIndex(t => t.Email)
                   .IsUnique();

            builder.Property(t => t.PhoneNumber)
                   .IsRequired()
                   .HasMaxLength(15);

            builder.Property(t => t.AlternatePhoneNumber)
                   .HasMaxLength(15);

            builder.Property(t => t.Address)
                   .HasMaxLength(500);

            builder.Property(t => t.Qualification)
                   .HasMaxLength(200);

            builder.Property(t => t.Experience)
                   .HasPrecision(5, 2);

            builder.Property(t => t.Salary)
                   .HasPrecision(18, 2);

            builder.Property(t => t.IsClassTeacher)
                   .HasDefaultValue(false);

            builder.Property(t => t.IsActive)
                   .HasDefaultValue(true);

            builder.Property(t => t.CreatedBy)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.Property(t => t.CreatedDate)
                   .HasDefaultValueSql("GETDATE()");

            builder.Property(t => t.UpdatedBy)
                   .HasMaxLength(450);

            //==========================
            // Relationships
            //==========================

            // Teacher -> User
            builder.HasOne(t => t.User)
                   .WithOne(u => u.Teacher)
                   .HasForeignKey<Teacher>(t => t.UserId)
                   .HasConstraintName("FK_Teacher_User")
                   .OnDelete(DeleteBehavior.Restrict);

            // Teacher -> Department
            builder.HasOne(t => t.Department)
                   .WithMany(d => d.Teachers)
                   .HasForeignKey(t => t.DepartmentId)
                   .HasConstraintName("FK_Teacher_Department")
                   .OnDelete(DeleteBehavior.Restrict);

            // CreatedBy User
            builder.HasOne(t => t.CreatedByUser)
                   .WithMany(u => u.CreatedTeachers)
                   .HasForeignKey(t => t.CreatedBy)
                   .HasConstraintName("FK_Teacher_CreatedBy")
                   .OnDelete(DeleteBehavior.Restrict);

            // UpdatedBy User
            builder.HasOne(t => t.UpdatedByUser)
                   .WithMany(u => u.UpdatedTeachers)
                   .HasForeignKey(t => t.UpdatedBy)
                   .HasConstraintName("FK_Teacher_UpdatedBy")
                   .OnDelete(DeleteBehavior.Restrict);

            // Teacher -> TeacherAssignments
            builder.HasMany(t => t.TeacherAssignments)
                   .WithOne(a => a.Teacher)
                   .HasForeignKey(a => a.TeacherId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}