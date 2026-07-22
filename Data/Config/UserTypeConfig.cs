using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class UserTypeConfig : IEntityTypeConfiguration<UserType>
    {
        public void Configure(EntityTypeBuilder<UserType> builder)
        {

            builder.HasKey(x => x.Id);
            // Id
            builder.Property(x => x.Id)
                   .UseIdentityColumn();

            // Name
            builder.Property(x => x.Name)
                   .HasMaxLength(250)
                   .IsRequired();

            // Description
            builder.Property(x => x.Description)
                   .HasMaxLength(1500);

            // Table Name
            builder.ToTable("UserTypes");


                builder.HasData(new List<UserType>()
                {
                    new UserType { Id = 1, Name = "Admin", Description = "Administrator with full access" },
                    new UserType { Id = 2, Name = "Student", Description = "Student with limited access" },
                    new UserType { Id = 3, Name = "Teacher", Description = "Teacher with specific access" },
                    new UserType { Id = 4, Name = "None_teaching Staff", Description = "Parent  user with minimal access" }



                });
        }
    }
}

