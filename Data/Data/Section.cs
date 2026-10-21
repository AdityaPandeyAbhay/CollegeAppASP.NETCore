using System;
using System.Collections.Generic;
using System.Xml;

namespace Data.Data
{
    public class Section
    {
        public int Id { get; set; }

        public int SchoolClassId { get; set; }

        public string SectionCode { get; set; } = string.Empty;

        public string SectionName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }

        public int Capacity { get; set; }

        public string? RoomNumber { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation

        public virtual SchoolClass? SchoolClass { get; set; }

        public virtual ICollection<StudentAcademicYear> StudentAcademicYears { get; set; }
            = new List<StudentAcademicYear>();

        public virtual ICollection<TeacherAssignment> TeacherAssignments { get; set; }
          = new List<TeacherAssignment>();

        //public virtual ICollection<Attendance> Attendances { get; set; }
        //    = new List<Attendance>();

        //public virtual ICollection<TimeTable> TimeTables { get; set; }
        //    = new List<TimeTable>();

        public virtual ICollection<Student> Students { get; set; }
             = new List<Student>();
        public ICollection<ResultBatch> ResultBatches { get; set; } = new List<ResultBatch>();
    }
}