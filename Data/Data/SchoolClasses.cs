using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;
using static System.Collections.Specialized.BitVector32;

namespace Data.Data
{
    public class SchoolClass
    {
        public int Id { get; set; }

        public int DepartmentId { get; set; }

        public string ClassCode { get; set; } = string.Empty;

        public string ClassName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation

        public virtual Department? Department { get; set; }

        public virtual ICollection<Section> Sections { get; set; }
            = new List<Section>();

       public virtual ICollection<TeacherAssignment> TeacherAssignments { get; set; }
           = new List<TeacherAssignment>();

        public virtual ICollection<StudentAcademicYear> StudentAcademicYears { get; set; }
            = new List<StudentAcademicYear>();

        //public virtual ICollection<FeeStructure> FeeStructures { get; set; }
        //    = new List<FeeStructure>();

        //public virtual ICollection<TimeTable> TimeTables { get; set; }
        //    = new List<TimeTable>();
        public virtual ICollection<FeeStructure> FeeStructures { get; set; }
                = new List<FeeStructure>();
        public virtual ICollection<Student> Students { get; set; }
               = new List<Student>();
        public ICollection<ResultBatch> ResultBatches { get; set; } = new List<ResultBatch>();
       
    }
}