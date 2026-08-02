using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Data.Config
{
    public class StudentFeeConfig : IEntityTypeConfiguration<StudentFee>
    {
        public void Configure(EntityTypeBuilder<StudentFee> builder)
        {
            builder.ToTable("StudentFees");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Amount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Discount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Fine)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.TotalAmount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.PaidAmount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.BalanceAmount)
                   .HasColumnType("decimal(18,2)");

            builder.Property(x => x.InvoiceNo)
                   .HasMaxLength(50);

            builder.Property(x => x.Status)
                   .HasMaxLength(30);

            builder.HasOne(x => x.Student)
                .WithMany(x => x.StudentFees)
                .HasForeignKey(x => x.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.FeeStructure)
                .WithMany(x => x.StudentFees)
                .HasForeignKey(x => x.FeeStructureId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
