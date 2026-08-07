using Model;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Data.Data
{
    public class ResultBatch
    {
        public int Id { get; set; }

        // Academic Year
        public int AcademicYearId { get; set; }
        public AcademicYear AcademicYear { get; set; } = null!;

        // Class
        public int ClassId { get; set; }
        public SchoolClass SchoolClass { get; set; } = null!;

        // Section
        public int SectionId { get; set; }
        public Section Section { get; set; } = null!;

        // Exam
        public int ExamId { get; set; }
        public Exam Exam { get; set; } = null!;

        // Publish Status
        public bool IsPublished { get; set; } = false;

        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation
        public ICollection<Result> Results { get; set; } = new List<Result>();
    }
}
