using System;
using System.Collections.Generic;
using System.Text;

using System.ComponentModel.DataAnnotations;

namespace Data.Data
{
    public class Exam
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string ExamName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation Property
        public ICollection<ResultBatch> ResultBatches { get; set; } = new List<ResultBatch>();
    }
}
