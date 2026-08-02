using System;
using System.Collections.Generic;
using System.Xml;

namespace Data.Data
{
    public class Subject
    {
        public int Id { get; set; }

        public int DepartmentId { get; set; }

        public string SubjectCode { get; set; } = string.Empty;

        public string SubjectName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int TheoryMarks { get; set; }

        public int PracticalMarks { get; set; }

        public bool IsOptional { get; set; }

        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation

        public virtual Department? Department { get; set; }

        public virtual ICollection<TeacherAssignment> TeacherAssignments { get; set; }
            = new List<TeacherAssignment>();

        //public virtual ICollection<ExamSubject> ExamSubjects { get; set; }
        //    = new List<ExamSubject>();

        //public virtual ICollection<TimeTable> TimeTables { get; set; }
        //    = new List<TimeTable>();
    }
}