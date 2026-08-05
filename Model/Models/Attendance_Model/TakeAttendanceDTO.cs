using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Attendance_Model
{
    public class TakeAttendanceDTO
    {
        public int TeacherAssignmentId { get; set; }

        public DateOnly AttendanceDate { get; set; }

        public string? Remarks { get; set; }

        public List<AttendanceStudentDTO> Students { get; set; }
            = new();
    }
}