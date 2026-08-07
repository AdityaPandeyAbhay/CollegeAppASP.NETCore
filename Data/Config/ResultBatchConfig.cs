using System;
using System.Collections.Generic;
using System.Text;

using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations
{
    public class ResultBatchConfig : IEntityTypeConfiguration<ResultBatch>
    {
        public void Configure(EntityTypeBuilder<ResultBatch> builder)
        {
            builder.ToTable("ResultBatches");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.CreatedBy)
                   .HasMaxLength(100);

            builder.Property(x => x.UpdatedBy)
                   .HasMaxLength(100);

            builder.HasOne(x => x.AcademicYear)
                   .WithMany(x => x.ResultBatches)
                   .HasForeignKey(x => x.AcademicYearId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.SchoolClass)
                   .WithMany(x => x.ResultBatches)
                   .HasForeignKey(x => x.ClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Section)
                   .WithMany(x => x.ResultBatches)
                   .HasForeignKey(x => x.SectionId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Exam)
                   .WithMany(x => x.ResultBatches)
                   .HasForeignKey(x => x.ExamId)
                   .OnDelete(DeleteBehavior.Restrict);

            // One batch per AcademicYear + Class + Section + Exam
            builder.HasIndex(x => new
            {
                x.AcademicYearId,
                x.ClassId,
                x.SectionId,
                x.ExamId
            }).IsUnique();
        }
    }
}
