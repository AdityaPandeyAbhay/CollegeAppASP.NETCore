using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class RolePrivilegeConfig : IEntityTypeConfiguration<RolePrivilege>
    {
        public void Configure(EntityTypeBuilder<RolePrivilege> builder)
        {
            builder.ToTable("RolePrivileges");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .UseIdentityColumn();

            builder.Property(x => x.RolePrivilegeName)
                   .HasMaxLength(500)
                   .IsRequired();

            builder.HasIndex(x => x.RolePrivilegeName)
                   .IsUnique();

            builder.Property(x => x.Description)
                   .HasMaxLength(500);

            builder.Property(x => x.IsActive)
                   .HasDefaultValue(false);

            builder.Property(x => x.IsDeleted)
                   .HasDefaultValue(false);

            builder.Property(x => x.CreatedDate)
                   .HasDefaultValueSql("GETDATE()");

            builder.Property(x => x.ModifyDate)
                   .HasDefaultValueSql("GETDATE()");


            // Role relationship
            builder.HasOne(x => x.Role)
                   .WithMany(n=>n.RolePrivileges)
                   .HasForeignKey(x => x.RoleId)
                   .HasConstraintName("FK_RolePrivileges_Roles")
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}