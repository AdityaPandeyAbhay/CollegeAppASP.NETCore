using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Model.Models.Student_Model
{
    public class StudentPromotionItemDTO
    {
        [Required]
        public int StudentId { get; set; }

        public string? NewRollNumber { get; set; }

        public string Status { get; set; } = "Active";
    }

    public class PromoteStudentDTO
    {
        [Required]
        public int SourceAcademicYearId { get; set; }

        [Required]
        public int SourceSchoolClassId { get; set; }

        [Required]
        public int SourceSectionId { get; set; }

        [Required]
        public int TargetAcademicYearId { get; set; }

        [Required]
        public int TargetDepartmentId { get; set; }

        [Required]
        public int TargetSchoolClassId { get; set; }

        [Required]
        public int TargetSectionId { get; set; }

        [Required]
        public List<StudentPromotionItemDTO> Students { get; set; } = new List<StudentPromotionItemDTO>();

        public string? Remarks { get; set; }
    }

    public class EnrollStudentDTO
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        public int AcademicYearId { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        public int SchoolClassId { get; set; }

        [Required]
        public int SectionId { get; set; }

        public string? RollNumber { get; set; }

        public string Status { get; set; } = "Active";

        public string? Remarks { get; set; }
    }
}
