using System;
using System.Collections.Generic;
using System.Text;

using System.ComponentModel.DataAnnotations;

namespace Data.Data
{
    public class Result
    {
        public int Id { get; set; }

        // Result Batch
        public int ResultBatchId { get; set; }
        public ResultBatch ResultBatch { get; set; } = null!;

        // Student
        public int StudentId { get; set; }
        public Student Student { get; set; } = null!;

        // Summary
        public decimal TotalMarks { get; set; }

        public decimal ObtainedMarks { get; set; }

        public decimal Percentage { get; set; }

        [MaxLength(5)]
        public string? Grade { get; set; }

        public int? Rank { get; set; }

        [MaxLength(20)]
        public string ResultStatus { get; set; } = "Pending";

        // PDF
        [MaxLength(255)]
        public string? PdfFileName { get; set; }

        [MaxLength(500)]
        public string? PdfFilePath { get; set; }

        public DateTime? PublishedDate { get; set; }

        // Audit
        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation
        public ICollection<ResultDetail> ResultDetails { get; set; }
            = new List<ResultDetail>();
    }
}
