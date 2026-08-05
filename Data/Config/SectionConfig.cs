using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CollegeApp.Data.Config
{
    public class SectionConfig : IEntityTypeConfiguration<Section>
    {
        public void Configure(EntityTypeBuilder<Section> builder)
        {
            // Table Name
            builder.ToTable("Sections");

            // Primary Key
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            // Properties
            builder.Property(x => x.SectionCode)
                   .HasMaxLength(20)
                   .IsRequired();

            builder.HasIndex(x => x.SectionCode)
                   .IsUnique();

            builder.Property(x => x.SectionName)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.Property(x => x.Capacity)
                   .IsRequired();

            builder.Property(x => x.RoomNumber)
                   .HasMaxLength(20);

            builder.Property(x => x.Description)
                   .HasMaxLength(500);

            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(450);

            builder.Property(x => x.CreatedDate)
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(450);

            // Relationship with SchoolClass
            builder.HasOne(x => x.SchoolClass)
                   .WithMany(x => x.Sections)
                   .HasForeignKey(x => x.SchoolClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Relationship with TeacherAssignment
            builder.HasMany(x => x.TeacherAssignments)
                   .WithOne(x => x.Section)
                   .HasForeignKey(x => x.SectionId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Composite Unique Index
            builder.HasIndex(x => new
            {
                x.SchoolClassId,
                x.SectionName
            })
            .IsUnique();

            // Check Constraint
            builder.ToTable(t =>
            {
                t.HasCheckConstraint(
                    "CK_Section_Capacity",
                    "[Capacity] > 0");
            });

            builder.Property(x => x.DisplayOrder)
       .IsRequired()
       .HasDefaultValue(1);
        }
    }
}