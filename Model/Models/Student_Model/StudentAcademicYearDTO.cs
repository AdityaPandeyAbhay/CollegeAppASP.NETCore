using System;

namespace Model.Models.Student_Model
{
    public class StudentAcademicYearDTO
    {
        public int Id { get; set; }

        public int StudentId { get; set; }
        public string AdmissionNumber { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string? Photo { get; set; }

        public int AcademicYearId { get; set; }
        public string AcademicYearName { get; set; } = string.Empty;

        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;

        public int SchoolClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;

        public int SectionId { get; set; }
        public string SectionName { get; set; } = string.Empty;

        public string? RollNumber { get; set; }
        public string Status { get; set; } = "Active";
        public bool IsPromoted { get; set; }
        public DateTime EnrollmentDate { get; set; }
        public string? Remarks { get; set; }

        public string? PromotedToClassName { get; set; }
        public string? PromotedToSectionName { get; set; }
        public string? PromotedToYearName { get; set; }
    }
}
