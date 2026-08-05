using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Attendance_Model
{
    public class AttendanceStudentDTO
    {
        // Only for UI serial number (not stored in DB)
        public int SrNo { get; set; }

        public int StudentId { get; set; }

        public string AdmissionNumber { get; set; } = string.Empty;

        public string StudentName { get; set; } = string.Empty;

        // Present / Absent / Leave / Late
        public string AttendanceStatus { get; set; } = "Present";

        public string? Remarks { get; set; }
    }
}
