using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class UserTypeConfig : IEntityTypeConfiguration<UserType>
    {
        public void Configure(EntityTypeBuilder<UserType> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .UseIdentityColumn();

            builder.Property(x => x.Name)
                   .HasMaxLength(250)
                   .IsRequired();

            builder.Property(x => x.Description)
                   .HasMaxLength(1500)
                   .IsRequired();

            builder.ToTable("UserTypes");
        }
    }
}