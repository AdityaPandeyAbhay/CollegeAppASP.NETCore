using System;
using System.ComponentModel.DataAnnotations;

namespace CollegeApp.Model.Validaters
{
    public class DateCheckAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                // Leave null handling to [Required] if you use it; treat null as valid here.
                return ValidationResult.Success;
            }

            if (value is not DateTime date)
            {
                return new ValidationResult("Invalid date value.");
            }

            if (date < DateTime.Today)
            {
                return new ValidationResult("The date must be greater than or equal to today's date.");
            }

            return ValidationResult.Success;
        }
    }
}
