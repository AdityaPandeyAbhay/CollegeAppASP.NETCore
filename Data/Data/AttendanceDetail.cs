using System;
using System.Collections.Generic;
using System.Text;
namespace Data.Data
{
    public class AttendanceDetail
    {
        public int Id { get; set; }

        // FK -> Attendance
        public int AttendanceId { get; set; }

        // FK -> Student
        public int StudentId { get; set; }

        // Present / Absent / Late / Leave / Holiday
        public string AttendanceStatus { get; set; } = "Present";

        public string? Remarks { get; set; }

        #region Audit

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        #endregion

        #region Navigation Properties

        public virtual Attendance Attendance { get; set; } = null!;

        public virtual Student Student { get; set; } = null!;

        #endregion
    }
}
