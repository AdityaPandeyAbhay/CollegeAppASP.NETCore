using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace Model.Models.Result_Model
{
    public class UpdateExamDTO
    {
        [Required]
        public int Id { get; set; }

        [Required(ErrorMessage = "Exam name is required.")]
        [MaxLength(100)]
        public string ExamName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}