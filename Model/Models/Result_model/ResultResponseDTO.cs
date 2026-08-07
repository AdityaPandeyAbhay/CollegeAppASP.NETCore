using System;
using System.Collections.Generic;
using System.Text;

using System.Collections.Generic;

namespace Model.Models.Result_Model
{
    public class ResultResponseDTO
    {
        public int ResultBatchId { get; set; }

        public string AcademicYear { get; set; } = string.Empty;

        public string ClassName { get; set; } = string.Empty;

        public string SectionName { get; set; } = string.Empty;

        public string ExamName { get; set; } = string.Empty;

        public bool IsPublished { get; set; }

        public List<StudentResultDTO> Students { get; set; } = new();
    }
}