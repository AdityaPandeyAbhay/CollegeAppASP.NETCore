using CollegeApp.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Data.Data
{
    public class Teacher
    {
        public int Id { get; set; }

        // FK to User (Login Table)
        public string  UserId { get; set; } = string.Empty;
        public virtual required User User { get; set; }

        public int DepartmentId { get; set; }

        public virtual required Department Department { get; set; }

        public string TeacherCode { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string? AlternatePhoneNumber { get; set; }

        public string? Address { get; set; }

        public string Qualification { get; set; } = string.Empty;

        public decimal Experience { get; set; }

        public DateTime JoiningDate { get; set; }

        public decimal Salary { get; set; }

        public bool IsClassTeacher { get; set; }
        

        public bool IsActive { get; set; } = true;

        // Audit
        public string CreatedBy { get; set; }= string.Empty;
        public virtual required User CreatedByUser { get; set; } 

        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }
        public virtual required User UpdatedByUser { get; set; }

        public DateTime? UpdatedDate { get; set; }


        // Navigation
        public virtual ICollection<TeacherAssignment> TeacherAssignments { get; set; }
           = new List<TeacherAssignment>();
    }
}
