using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Student_Model
{
    public class GetStudentDTO
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public string AdmissionNumber { get; set; } = string.Empty;

        public DateTime AdmissionDate { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } = string.Empty;

        public DateTime DOB { get; set; }

        public string Gender { get; set; } = string.Empty;

        public string? BloodGroup { get; set; }

        public string? Photo { get; set; }

        public string? AadhaarNumber { get; set; }

        public string? Religion { get; set; }

        public string? Category { get; set; }

        public string? Nationality { get; set; }

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string? AlternatePhoneNumber { get; set; }

        public string Address { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}
