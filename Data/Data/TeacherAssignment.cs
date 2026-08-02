using System;
using System.Collections.Generic;
using System.Text;

namespace Data.Data
{
    public class TeacherAssignment
    {
        public int Id { get; set; }

        public int TeacherId { get; set; }
        public virtual Teacher Teacher { get; set; } = null!;

        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; } = null!;

        public int SchoolClassId { get; set; }
        public virtual SchoolClass SchoolClass { get; set; } = null!;

        public int SectionId { get; set; }
        public virtual Section Section { get; set; } = null!;

        public int SubjectId { get; set; }
        public virtual Subject Subject { get; set; } = null!;

        public int AcademicYearId { get; set; }
        public virtual AcademicYear AcademicYear { get; set; } = null!;

        // Class teacher flag
        public bool IsClassTeacher { get; set; }

        public bool IsActive { get; set; } = true;

        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
}
