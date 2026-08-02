using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Data.Config
{

    public class FeeStructureConfig : IEntityTypeConfiguration<FeeStructure>
    {
        public void Configure(EntityTypeBuilder<FeeStructure> builder)
        {
            builder.ToTable("FeeStructures");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Amount)
                   .HasColumnType("decimal(18,2)");

            builder.HasOne(x => x.Department)
                .WithMany(x => x.FeeStructures)
                .HasForeignKey(x => x.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);
            builder.HasOne(x => x.SchoolClass)
                   .WithMany(x => x.FeeStructures)
                   .HasForeignKey(x => x.ClassId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.AcademicYear)
                .WithMany(x => x.FeeStructures)
                .HasForeignKey(x => x.AcademicYearId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.FeeCategory)
                .WithMany(x => x.FeeStructures)
                .HasForeignKey(x => x.FeeCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
