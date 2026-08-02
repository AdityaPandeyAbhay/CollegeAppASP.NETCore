using Data.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Data.Config
{
    public class FeeCategoryConfig : IEntityTypeConfiguration<FeeCategory>
    {
        public void Configure(EntityTypeBuilder<FeeCategory> builder)
        {
            builder.ToTable("FeeCategories");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.CategoryName)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(x => x.Description)
                   .HasMaxLength(300);

            builder.Property(x => x.IsActive)
                   .HasDefaultValue(true);
        }
    }
}
