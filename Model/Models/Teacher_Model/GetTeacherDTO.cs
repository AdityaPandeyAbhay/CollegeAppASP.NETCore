using System;

namespace Model.Models.Teacher_Model
{
    public class GetTeacherDTO
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public int DepartmentId { get; set; }

        public string TeacherCode { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } = string.Empty;

        public string DateOfBirth { get; set; } = string.Empty;

        public string Gender { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string? AlternatePhoneNumber { get; set; }

        public string? Address { get; set; }

        public string Qualification { get; set; } = string.Empty;

        public decimal Experience { get; set; }

        public string JoiningDate { get; set; } = string.Empty;

        public decimal Salary { get; set; }

        public bool IsClassTeacher { get; set; }

        public bool IsActive { get; set; }

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}