using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class StudentConfig : IEntityTypeConfiguration<Student>
    {

      
        public void Configure(EntityTypeBuilder<Student> builder)
        {
            builder.ToTable("Students");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).UseIdentityColumn();

            builder.Property(n => n.StudentName).IsRequired();
            builder.Property(n => n.StudentName).HasMaxLength(250);
            builder.Property(n => n.Address).IsRequired(false).HasMaxLength(500);
            builder.Property(n => n.Email).IsRequired().HasMaxLength(250);

            builder.HasData(
                new Student
                {
                    Id = 1,
                    StudentName = "Aditya",
                    Address = "India",
                    Email = "aditya@gmail.com",

                },
                new Student
                {
                    Id = 2,
                    StudentName = "Abhay",
                    Address = "India",
                    Email = "abhay@gmail.com",

                },
                 new Student
                 {
                     Id = 3,
                     StudentName = "Abhay",
                     Address = "India",
                     Email = "abhay@gmail.com",
                     DOB = new DateTime(2002, 07, 15)
                 }
            );

            builder.HasOne(s => s.Department)
                   .WithMany(d => d.Students)
                   .HasForeignKey(s => s.DepartmentId)
                   .HasConstraintName("FK_Student_Department")
                   .OnDelete(DeleteBehavior.SetNull);


        }
    }
}
