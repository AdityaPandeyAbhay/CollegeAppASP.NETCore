using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Model.Models.Result_Model
{
    public class CreateResultBatchDTO
    {
        [Required]
        public int AcademicYearId { get; set; }

        [Required]
        public int ClassId { get; set; }

        [Required]
        public int SectionId { get; set; }

        [Required]
        public int ExamId { get; set; }

        public List<StudentMarkDTO> Students { get; set; } = new();
    }
}