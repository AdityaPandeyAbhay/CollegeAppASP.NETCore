using System;
using System.Collections.Generic;
using System.Text;

using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configuration
{
    public class AttendanceDetailConfig : IEntityTypeConfiguration<AttendanceDetail>
    {
        public void Configure(EntityTypeBuilder<AttendanceDetail> builder)
        {
            builder.ToTable("AttendanceDetails");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            builder.Property(x => x.AttendanceStatus)
                   .HasMaxLength(20)
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
             * Attendance
             *      |
             *      | 1
             *      |
             *      |------< AttendanceDetails
             */

            builder.HasOne(x => x.Attendance)
                   .WithMany(x => x.AttendanceDetails)
                   .HasForeignKey(x => x.AttendanceId)
                   .OnDelete(DeleteBehavior.Cascade);

            /*
             * Student
             *      |
             *      | 1
             *      |
             *      |------< AttendanceDetails
             */

            builder.HasOne(x => x.Student)
                   .WithMany(x => x.AttendanceDetails)
                   .HasForeignKey(x => x.StudentId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate student entries in one attendance session
            builder.HasIndex(x => new
            {
                x.AttendanceId,
                x.StudentId
            })
            .IsUnique();
        }
    }
}