using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Attendance_Model
{
    public class AttendanceListDTO
    {
        public int AttendanceId { get; set; }

        public int TeacherAssignmentId { get; set; }

        public int SchoolClassId { get; set; }

        public int SectionId { get; set; }

        public int AcademicYearId { get; set; }

        public DateOnly AttendanceDate { get; set; }

        public string TeacherName { get; set; } = string.Empty;

        public string ClassName { get; set; } = string.Empty;

        public string SectionName { get; set; } = string.Empty;

        public string SubjectName { get; set; } = string.Empty;

        public string? Remarks { get; set; }

        public int PresentCount { get; set; }

        public int AbsentCount { get; set; }

        public int LeaveCount { get; set; }

        public int LateCount { get; set; }

        public List<AttendanceStudentDTO> Students { get; set; } = new();
    }
}
