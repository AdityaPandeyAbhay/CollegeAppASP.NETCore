using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Config
{
    public class NonTeachingStaffConfig : IEntityTypeConfiguration<NonTeachingStaff>
    {
        public void Configure(EntityTypeBuilder<NonTeachingStaff> builder)
        {
            builder.ToTable("NonTeachingStaffs");

            // Primary Key
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();


            // User Relationship
            builder.Property(x => x.UserId)
                   .HasMaxLength(450)
                   .IsRequired();


            builder.HasOne(x => x.User)
                   .WithOne(x => x.NonTeachingStaff)
                   .HasForeignKey<NonTeachingStaff>(x => x.UserId)
                   .OnDelete(DeleteBehavior.Restrict);


            builder.HasIndex(x => x.UserId)
                   .IsUnique();



            // Staff Code
            builder.Property(x => x.StaffCode)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.HasIndex(x => x.StaffCode)
                   .IsUnique();



            // Name
            builder.Property(x => x.FirstName)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.MiddleName)
                   .HasMaxLength(50);

            builder.Property(x => x.LastName)
                   .HasMaxLength(50)
                   .IsRequired();



            // Personal Information
            builder.Property(x => x.Gender)
                   .HasMaxLength(10);

            builder.Property(x => x.Email)
                   .HasMaxLength(100);

            builder.Property(x => x.PhoneNumber)
                   .HasMaxLength(15);

            builder.Property(x => x.AlternatePhoneNumber)
                   .HasMaxLength(15);

            builder.Property(x => x.FatherName)
                   .HasMaxLength(100);

            builder.Property(x => x.MotherName)
                   .HasMaxLength(100);

            builder.Property(x => x.Photo)
                   .HasColumnType("nvarchar(max)");

            builder.Property(x => x.EducationPdf)
                   .HasColumnType("nvarchar(max)");

            builder.Property(x => x.EducationFileName)
                   .HasMaxLength(200);

            builder.Property(x => x.Address)
                   .HasMaxLength(300);



            // Professional Information
            builder.Property(x => x.Designation)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(x => x.Qualification)
                   .HasMaxLength(100);



            // Salary
            builder.Property(x => x.Salary)
                   .HasPrecision(18, 2);



            // Status
            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);



            // Audit Fields
            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(450)
                   .IsRequired();

            builder.Property(x => x.CreatedDate)
                   .HasDefaultValueSql("GETDATE()");


            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(450);

            builder.Property(x => x.UpdatedDate);
        }
    }
}