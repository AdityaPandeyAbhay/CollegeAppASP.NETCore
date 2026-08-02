using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.NonTeachingStaff
{
    public class GetNonTeachingStaffDTO
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string StaffCode { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } = string.Empty;

        public string DateOfBirth { get; set; } = string.Empty;

        public string Gender { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string? AlternatePhoneNumber { get; set; }

        public string? Address { get; set; }

        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        public string Designation { get; set; } = string.Empty;

        public string Qualification { get; set; } = string.Empty;

        public decimal Salary { get; set; }

        public string JoiningDate { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public string UpdatedBy { get; set; } = string.Empty;
    }
}
