using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace Model.Models.Student_Model
{
      public class CreateStudentDTO
        {
            [Required]
            public string UserId { get; set; } = string.Empty;

            [Required]
            public int DepartmentId { get; set; }

             [Required]
            public int SchoolClassId { get; set; }


             [Required]
             public int SectionId { get; set; }

        [Required]
            [StringLength(20)]
            public string AdmissionNumber { get; set; } = string.Empty;

            [Required]
            public DateTime AdmissionDate { get; set; }

            [Required]
            [StringLength(50)]
            public string FirstName { get; set; } = string.Empty;

            [StringLength(50)]
            public string? MiddleName { get; set; }

            [Required]
            [StringLength(50)]
            public string LastName { get; set; } = string.Empty;

            [Required]
            public DateTime DOB { get; set; }

            [Required]
            public string Gender { get; set; } = string.Empty;

            public string? BloodGroup { get; set; }

            public string? Photo { get; set; }

            public string? AadhaarNumber { get; set; }

            public string? Religion { get; set; }

            public string? Category { get; set; }

            public string? Nationality { get; set; }

            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            [Phone]
            public string PhoneNumber { get; set; } = string.Empty;

            public string? AlternatePhoneNumber { get; set; }

            [Required]
            public string Address { get; set; } = string.Empty;
      }
}

