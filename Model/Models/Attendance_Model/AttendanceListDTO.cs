using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Attendance_Model
{
    public class AttendanceListDTO
    {
        public int AttendanceId { get; set; }

        public DateOnly AttendanceDate { get; set; }

        public string TeacherName { get; set; } = string.Empty;

        public string ClassName { get; set; } = string.Empty;

        public string SectionName { get; set; } = string.Empty;

        public string SubjectName { get; set; } = string.Empty;

        public int PresentCount { get; set; }

        public int AbsentCount { get; set; }

        public int LeaveCount { get; set; }

        public int LateCount { get; set; }
    }
}
