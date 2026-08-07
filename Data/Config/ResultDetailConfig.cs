using System;
using System.Collections.Generic;
using System.Text;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Data.Configurations
{
    public class ResultDetailConfig : IEntityTypeConfiguration<ResultDetail>
    {
        public void Configure(EntityTypeBuilder<ResultDetail> builder)
        {
            builder.ToTable("ResultDetails");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.MaxMarks)
                   .HasColumnType("decimal(10,2)");

            builder.Property(x => x.ObtainedMarks)
                   .HasColumnType("decimal(10,2)");

            builder.Property(x => x.Grade)
                   .HasMaxLength(5);

            builder.Property(x => x.Remarks)
                   .HasMaxLength(500);

            builder.HasOne(x => x.Result)
                   .WithMany(x => x.ResultDetails)
                   .HasForeignKey(x => x.ResultId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Subject)
                   .WithMany(x => x.ResultDetails)
                   .HasForeignKey(x => x.SubjectId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Prevent duplicate subject entries in one result
            builder.HasIndex(x => new
            {
                x.ResultId,
                x.SubjectId
            }).IsUnique();
        }
    }
}