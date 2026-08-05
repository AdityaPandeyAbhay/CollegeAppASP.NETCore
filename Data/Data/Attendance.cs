using System;
using System.Collections.Generic;
using System.Text;

using System.ComponentModel.DataAnnotations.Schema;

namespace Data.Data
{
    public class Attendance
    {
        public int Id { get; set; }

        // FK -> TeacherAssignment
        public int TeacherAssignmentId { get; set; }

        // Attendance Date
        public DateOnly AttendanceDate { get; set; }

        // Optional Remarks
        public string? Remarks { get; set; }

        // Active / Locked / Submitted
        public string Status { get; set; } = "Submitted";

        #region Audit

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        #endregion

        #region Navigation Properties

        public virtual TeacherAssignment TeacherAssignment { get; set; } = null!;

        public virtual ICollection<AttendanceDetail> AttendanceDetails { get; set; }
            = new List<AttendanceDetail>();

       
        #endregion
    }
}