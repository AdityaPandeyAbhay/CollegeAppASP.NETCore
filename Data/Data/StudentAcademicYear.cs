using System;
using CollegeApp.Data;

namespace Data.Data
{
    public class StudentAcademicYear
    {
        public int Id { get; set; }

        // FK -> Student
        public int StudentId { get; set; }
        public virtual Student Student { get; set; } = null!;

        // FK -> AcademicYear
        public int AcademicYearId { get; set; }
        public virtual AcademicYear AcademicYear { get; set; } = null!;

        // FK -> Department
        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; } = null!;

        // FK -> SchoolClass
        public int SchoolClassId { get; set; }
        public virtual SchoolClass SchoolClass { get; set; } = null!;

        // FK -> Section
        public int SectionId { get; set; }
        public virtual Section Section { get; set; } = null!;

        // Roll Number in this specific academic year
        public string? RollNumber { get; set; }

        // Status: "Active", "Promoted", "Completed", "Detained"
        public string Status { get; set; } = "Active";

        public bool IsPromoted { get; set; } = false;

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
        public DateTime? PromotionDate { get; set; }

        public string? Remarks { get; set; }

        #region Audit
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        #endregion
    }
}
