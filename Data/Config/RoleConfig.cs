using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class RoleConfig : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            // Table Name
            builder.ToTable("Roles");

            // Primary Key
            builder.HasKey(x => x.Id);

            // Id
            builder.Property(x => x.Id)
                   .UseIdentityColumn();

            // Role Name
            builder.Property(x => x.RoleName)
                   .HasMaxLength(500)
                   .IsRequired();

            // Make RoleName unique
            builder.HasIndex(x => x.RoleName)
                   .IsUnique();

            // Description
            builder.Property(x => x.Description)
                   .HasMaxLength(500);

            // Is Admin
            builder.Property(x => x.IsActive)
                   .HasDefaultValue(false);

            // Is Deleted
            builder.Property(x => x.IsDeleted)
                   .HasDefaultValue(false);

            // Created Date
            builder.Property(x => x.CreatedDate)
                   .HasDefaultValueSql("GETDATE()");

            // Modified Date
            builder.Property(x => x.ModifyDate)
                   .HasDefaultValueSql("GETDATE()");

        }
    }
}