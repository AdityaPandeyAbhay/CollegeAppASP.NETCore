using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.NonTeachingStaff
{
    public class CreateNonTeachingStaffDTO
    {
        public string UserId { get; set; } = string.Empty;

        public string StaffCode { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; } = string.Empty;

        public string? LastName { get; set; } = string.Empty;

        public string DateOfBirth { get; set; }

        public string Gender { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string? AlternatePhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public string Designation { get; set; } = string.Empty;

        public string Qualification { get; set; } = string.Empty;

        public decimal Salary { get; set; }

        public DateTime JoiningDate { get; set; }

    }
}
