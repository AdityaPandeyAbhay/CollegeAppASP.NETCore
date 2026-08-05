using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Attendance_Model
{
    public class UpdateAttendanceDTO
    {
        public int AttendanceId { get; set; }

        public string? Remarks { get; set; }

        public List<AttendanceStudentDTO> Students { get; set; }
            = new();
        public string Status { get; set; }
    }
}
