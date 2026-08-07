using System;
using System.Collections.Generic;
using System.Text;
using System;

namespace Model.Models.Result_Model
{
    public class ResultBatchResponseDTO
    {
        public int Id { get; set; }

        public int AcademicYearId { get; set; }

        public string AcademicYear { get; set; } = string.Empty;

        public int ClassId { get; set; }

        public string ClassName { get; set; } = string.Empty;

        public int SectionId { get; set; }

        public string SectionName { get; set; } = string.Empty;

        public int ExamId { get; set; }

        public string ExamName { get; set; } = string.Empty;

        public bool IsPublished { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}