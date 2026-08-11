using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Model.Models.Notice_Model;

namespace Data.Config
{
    public class NoticeConfig : IEntityTypeConfiguration<Notice>
    {
        public void Configure(EntityTypeBuilder<Notice> builder)
        {
            // Table name
            builder.ToTable("Notices");

            // Primary Key
            builder.HasKey(x => x.Id);

            // Id - Auto Increment
            builder.Property(x => x.Id)
                   .ValueGeneratedOnAdd();

            // Title
            builder.Property(x => x.Title)
                   .IsRequired()
                   .HasMaxLength(250);

            // Description
            builder.Property(x => x.Description)
                   .IsRequired();

            // Original PDF file name
            builder.Property(x => x.PdfFileName)
                   .IsRequired()
                   .HasMaxLength(255);

            // PDF relative path
            builder.Property(x => x.PdfPath)
                   .IsRequired()
                   .HasMaxLength(500);

            // Created By
            builder.Property(x => x.CreatedBy)
                   .IsRequired()
                   .HasMaxLength(450);

            // Created Date
            builder.Property(x => x.CreatedDate)
                   .IsRequired();

            // Published status
            // false = Draft
            // true  = Published
            builder.Property(x => x.IsPublished)
                   .IsRequired()
                   .HasDefaultValue(false);

            // Published Date
            // NULL until notice is published
            builder.Property(x => x.PublishedDate)
                   .IsRequired(false);

            // Active status
            // true = Active
            // false = Inactive
            builder.Property(x => x.IsActive)
                   .IsRequired()
                   .HasDefaultValue(true);
        }
    }
}
