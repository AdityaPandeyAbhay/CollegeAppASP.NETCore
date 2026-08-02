using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Subject_model
{
    public class CreateSubjectDTO
    {
        [Required]
        public int DepartmentId { get; set; }

        [Required]
        [StringLength(20)]
        public string SubjectCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string SubjectName { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Description { get; set; }

        [Range(0, 100)]
        public int TheoryMarks { get; set; }

        [Range(0, 100)]
        public int PracticalMarks { get; set; }

        public bool IsOptional { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
