using System;
using System.Collections.Generic;
using System.Text;

using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations
{
    public class ResultConfig : IEntityTypeConfiguration<Result>
    {
        public void Configure(EntityTypeBuilder<Result> builder)
        {
            builder.ToTable("Results");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.TotalMarks)
                   .HasColumnType("decimal(10,2)");

            builder.Property(x => x.ObtainedMarks)
                   .HasColumnType("decimal(10,2)");

            builder.Property(x => x.Percentage)
                   .HasColumnType("decimal(5,2)");

            builder.Property(x => x.Grade)
                   .HasMaxLength(5);

            builder.Property(x => x.ResultStatus)
                   .HasMaxLength(20);

            builder.Property(x => x.PdfFileName)
                   .HasMaxLength(255);

            builder.Property(x => x.PdfFilePath)
                   .HasMaxLength(500);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(100);

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(100);

            builder.HasOne(x => x.ResultBatch)
                   .WithMany(x => x.Results)
                   .HasForeignKey(x => x.ResultBatchId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Student)
                   .WithMany(x => x.Results)
                   .HasForeignKey(x => x.StudentId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(x => x.ResultDetails)
                   .WithOne(x => x.Result)
                   .HasForeignKey(x => x.ResultId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Prevent duplicate result for the same student in one batch
            builder.HasIndex(x => new
            {
                x.ResultBatchId,
                x.StudentId
            }).IsUnique();
        }
    }
}
