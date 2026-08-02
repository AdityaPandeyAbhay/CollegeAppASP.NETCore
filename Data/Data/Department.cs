using System;
using System.Collections.Generic;

namespace Data.Data
{
    public class Department
    {
        public int Id { get; set; }

        public string DepartmentCode { get; set; } = string.Empty;

        public string DepartmentName { get; set; } = string.Empty;
      
        public string? Description { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation Properties

        public virtual ICollection<SchoolClass> SchoolClasses { get; set; }
           = new List<SchoolClass>();

        public virtual ICollection<Subject> Subjects { get; set; }
          = new List<Subject>();

        public virtual ICollection<Teacher> Teachers { get; set; }
            = new List<Teacher>();
        public virtual ICollection<Student> Students { get; set; }
                = new List<Student>();

        public virtual ICollection<TeacherAssignment> TeacherAssignments { get; set; }
               = new List<TeacherAssignment>();
        public virtual ICollection<FeeStructure> FeeStructures { get; set; }
             = new List<FeeStructure>();
    }
}