using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Attendance_Model
{
    public class AttendanceResponseDTO
    {
        public int AttendanceId { get; set; }

        public int TeacherAssignmentId { get; set; }

        public DateOnly AttendanceDate { get; set; }

        public string? Remarks { get; set; }

        public string Status { get; set; } = string.Empty;

        public List<AttendanceStudentDTO> Students { get; set; }
            = new();
    }
}
