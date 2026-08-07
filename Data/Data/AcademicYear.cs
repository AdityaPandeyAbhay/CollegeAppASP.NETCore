using System;
using System.Collections.Generic;
using System.Xml;

namespace Data.Data
{
    public class AcademicYear
    {
        public int Id { get; set; }

        public string YearName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public bool IsCurrent { get; set; }

        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation

        //public virtual ICollection<StudentAcademicYear> StudentAcademicYears { get; set; }
        //    = new List<StudentAcademicYear>();

        public virtual ICollection<TeacherAssignment> TeacherAssignments { get; set; }
            = new List<TeacherAssignment>();
        public virtual ICollection<FeeStructure> FeeStructures { get; set; }
           = new List<FeeStructure>();

        //public virtual ICollection<FeeStructure> FeeStructures { get; set; }
        //    = new List<FeeStructure>();

        //public virtual ICollection<Exam> Exams { get; set; }
        //    = new List<Exam>();

        //public virtual ICollection<TimeTable> TimeTables { get; set; }
        //    = new List<TimeTable>();

        public ICollection<ResultBatch> ResultBatches { get; set; } = new List<ResultBatch>();
    }
}