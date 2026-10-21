using CollegeApp.Data;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Data.Data
{
    public class NonTeachingStaff
    {

        public int Id { get; set; }

        // Login User
        [StringLength(450)]
        public string UserId { get; set; } = string.Empty;
        public virtual User User { get; set; } = null!;

        [MaxLength(20)]
        public string StaffCode { get; set; } = string.Empty;

        [MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string MiddleName { get; set; } = string.Empty;

        [MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        public DateTime DateOfBirth { get; set; }

        [MaxLength(10)]
        public string Gender { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(15)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(15)]
        public string AlternatePhoneNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FatherName { get; set; }

        [MaxLength(100)]
        public string? MotherName { get; set; }

        public string? Photo { get; set; }

        public string? EducationPdf { get; set; }

        [MaxLength(200)]
        public string? EducationFileName { get; set; }

        [MaxLength(300)]
        public string Address { get; set; } = string.Empty;

        

        [MaxLength(100)]
        public string Designation { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Qualification { get; set; } = string.Empty;

        public decimal Salary { get; set; }

        public DateTime JoiningDate { get; set; }

        public bool IsActive { get; set; } = true;

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}