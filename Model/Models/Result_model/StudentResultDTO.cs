using System;
using System.Collections.Generic;
using System.Text;

using System;
using System.Collections.Generic;

namespace Model.Models.Result_Model
{
    public class StudentResultDTO
    {
        public int ResultId { get; set; }

        public int StudentId { get; set; }

        public string AdmissionNumber { get; set; } = string.Empty;

        public string StudentName { get; set; } = string.Empty;

        public decimal TotalMarks { get; set; }

        public decimal ObtainedMarks { get; set; }

        public decimal Percentage { get; set; }

        public string? Grade { get; set; }

        public int? Rank { get; set; }

        public string ResultStatus { get; set; } = string.Empty;

        public string? PdfFileName { get; set; }

        public string? PdfFilePath { get; set; }

        public DateTime? PublishedDate { get; set; }

        public List<ResultDetailDTO> Subjects { get; set; } = new();
    }
}