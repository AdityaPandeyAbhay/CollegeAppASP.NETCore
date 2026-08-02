using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.TeacherAssignment_Model
{
    public class GetTeacherAssignmentDTO
    {
        public int Id { get; set; }

        public int TeacherId { get; set; }

        public string TeacherName { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        public int SchoolClassId { get; set; }

        public string ClassName { get; set; } = string.Empty;

        public int SectionId { get; set; }

        public string SectionName { get; set; } = string.Empty;

        public int SubjectId { get; set; }

        public string SubjectName { get; set; } = string.Empty;

        public int AcademicYearId { get; set; }

        public string AcademicYear { get; set; } = string.Empty;

        public bool IsClassTeacher { get; set; }

        public bool IsActive { get; set; }
    }
}
