using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class StudentConfig : IEntityTypeConfiguration<Student>
    {
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            // Table
            builder.ToTable("Students");

            // Primary Key
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            // User
            builder.Property(x => x.UserId)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.HasIndex(x => x.UserId)
                   .IsUnique();

            // Admission
            builder.Property(x => x.AdmissionNumber)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.HasIndex(x => x.AdmissionNumber)
                   .IsUnique();

            builder.Property(x => x.AdmissionDate)
                   .IsRequired();

            // Personal Details
            builder.Property(x => x.FirstName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(x => x.MiddleName)
                   .HasMaxLength(100);

            builder.Property(x => x.LastName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(x => x.DOB)
                   .IsRequired();

            builder.Property(x => x.Gender)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(x => x.BloodGroup)
                   .HasMaxLength(10);

            builder.Property(x => x.Photo)
                   .HasMaxLength(500);

            builder.Property(x => x.AadhaarNumber)
                   .HasMaxLength(20);

            builder.HasIndex(x => x.AadhaarNumber)
                   .IsUnique();

            builder.Property(x => x.Religion)
                   .HasMaxLength(100);

            builder.Property(x => x.Category)
                   .HasMaxLength(100);

            builder.Property(x => x.Nationality)
                   .HasMaxLength(100);

            // Contact
            builder.Property(x => x.Email)
                   .IsRequired()
                   .HasMaxLength(250);

            builder.HasIndex(x => x.Email)
                   .IsUnique();

            builder.Property(x => x.PhoneNumber)
                   .IsRequired()
                   .HasMaxLength(15);

            builder.Property(x => x.AlternatePhoneNumber)
                   .HasMaxLength(15);

            builder.Property(x => x.Address)
                   .IsRequired()
                   .HasMaxLength(500);

            // Status
            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);

            // Audit
            builder.Property(x => x.CreatedBy)
                   .IsRequired()
                   .HasMaxLength(450);

            builder.Property(x => x.CreatedDate)
                   .IsRequired();

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(450);

            // ==========================
            // Relationships
            // ==========================

            // Student -> User
            builder.HasOne(x => x.User)
                   .WithOne()
                   .HasForeignKey<Student>(x => x.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Student -> Department
            builder.HasOne(x => x.Department)
                   .WithMany(x => x.Students)
                   .HasForeignKey(x => x.DepartmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Student -> SchoolClass
            builder.HasOne(x => x.SchoolClass)
                   .WithMany(x => x.Students)
                   .HasForeignKey(x => x.SchoolClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Student -> Section
            builder.HasOne(x => x.Section)
                   .WithMany(x => x.Students)
                   .HasForeignKey(x => x.SectionId)
                   .OnDelete(DeleteBehavior.Restrict);


            builder.HasIndex(x => new
            {
                x.SchoolClassId,
                x.SectionId
            });

            // CreatedBy User
            builder.HasOne(x => x.CreatedByUser)
                   .WithMany()
                   .HasForeignKey(x => x.CreatedBy)
                   .OnDelete(DeleteBehavior.Restrict);

            // UpdatedBy User
            builder.HasOne(x => x.UpdatedByUser)
                   .WithMany()
                   .HasForeignKey(x => x.UpdatedBy)
                   .OnDelete(DeleteBehavior.Restrict);

            // Student -> Documents
            //builder.HasMany(x => x.Documents)
            //       .WithOne(x => x.Student)
            //       .HasForeignKey(x => x.StudentId)
            //       .OnDelete(DeleteBehavior.Cascade);
        }
    }
}