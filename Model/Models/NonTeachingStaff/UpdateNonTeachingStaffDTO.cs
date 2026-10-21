using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.NonTeachingStaff
{
    public class UpdateNonTeachingStaffDTO
    {
        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string? AlternatePhoneNumber { get; set; }

        public string? Address { get; set; }

        public string Designation { get; set; } = string.Empty;

        public string Qualification { get; set; } = string.Empty;

        public string? FatherName { get; set; }

        public string? MotherName { get; set; }

        public string? Photo { get; set; }

        public string? EducationPdf { get; set; }

        public string? EducationFileName { get; set; }

        public DateTime JoiningDate { get; set; }

        public decimal Salary { get; set; }

        public bool IsActive { get; set; }
    }
}
