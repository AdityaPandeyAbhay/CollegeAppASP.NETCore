using System;
using System.Collections.Generic;
using System.Text;

using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configuration
{
    public class AttendanceConfig : IEntityTypeConfiguration<Attendance>
    {
        public void Configure(EntityTypeBuilder<Attendance> builder)
        {
            builder.ToTable("Attendances");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.AttendanceDate)
                   .IsRequired();

            builder.Property(x => x.Status)
                   .HasMaxLength(30)
                   .IsRequired();

            builder.Property(x => x.Remarks)
                   .HasMaxLength(500);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(100);

            builder.Property(x => x.ModifiedBy)
                   .HasMaxLength(100);

            builder.Property(x => x.CreatedDate)
                   .IsRequired();

            /*
             * One TeacherAssignment
             *        |
             *        |
             *       Many Attendances
             */

            builder.HasOne(a => a.TeacherAssignment)
                   .WithMany(t => t.Attendances)
                   .HasForeignKey(a => a.TeacherAssignmentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate attendance for the same assignment on the same day
            builder.HasIndex(a => new
            {
                a.TeacherAssignmentId,
                a.AttendanceDate
            })
            .IsUnique();
        }
    }
}
