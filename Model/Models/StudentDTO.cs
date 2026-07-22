using CollegeApp.Model.Validaters;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;

namespace CollegeApp.Models
{
    public class StudentDTO
    { 
        [ValidateNever]
        public int Id { get; set; }

        [Required(ErrorMessage = "Student Name is required.")]
        [StringLength(
            50,
            MinimumLength = 3,
            ErrorMessage = "Student Name must be between 3 and 50 characters."
        )]
        public string StudentName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; } = string.Empty;
        //[Required (ErrorMessage = "Age  is required.")]
        //[Range( 18, 65)]
        //public int Age { get; set; }

        [Required(ErrorMessage = "Address is required.")]
        [StringLength(
            100,
            MinimumLength = 5,
            ErrorMessage = "Address must be between 5 and 100 characters."
        )]
        public string Address { get; set; } = string.Empty;

        //[Required]
        //[EmailAddress]
        //[Compare(nameof(Email), ErrorMessage = "Email and Confirm Email must match.")]
        //public string ConfirmEmail { get; set; } = string.Empty;
        ////[DateCheck] 
        //public DateTime AdmissionDate { get; set; }

        public DateTime DOB {  get; set; }
        
    }
}