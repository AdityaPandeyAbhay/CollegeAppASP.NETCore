using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;




namespace CollegeApp.Data.Config
{
    public class UserConfig : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Primary Key
            builder.HasKey(x => x.Id);

            // Id
            builder.Property(x => x.Id)
                   .HasMaxLength(450)
                   .IsRequired();

            // Username
            builder.Property(x => x.Username)
                   .HasMaxLength(100)
                   .IsRequired();

            // Make Username unique
            builder.HasIndex(x => x.Username)
                   .IsUnique();

            // Password Hash
            builder.Property(x => x.Password)
                   .HasMaxLength(500)
                   .IsRequired();

            // Password Salt
            builder.Property(x => x.PasswordSalt)
                   .HasMaxLength(500)
                   .IsRequired();

            // User Type
            builder.Property(x => x.UserTypeId)
                   .IsRequired();

            // Is Active
            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);

            // Is Deleted
            builder.Property(x => x.IsDeleted)
                   .HasDefaultValue(false);

            // Created Date
            builder.Property(x => x.CreatedDate)
                   .HasDefaultValueSql("GETDATE()");

            // modify Date
            builder.Property(x => x.ModifyDate)
                   .HasDefaultValueSql("GETDATE()");

            builder.HasOne(x => x.UserType)
                   .WithMany(x => x.Users)
                   .HasForeignKey(x => x.UserTypeId)
                   .HasConstraintName("FK_Users_UserTypes")
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.UserRoleMappings)
                    .WithOne(x => x.User)
                    .HasForeignKey(x => x.UserId);


            // Table Name
            builder.ToTable("Users");
        }

    }
}
