using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models
{
    public class AcademicYearDTO
    {
        [ValidateNever]
        public int Id { get; set; }

        [Required(ErrorMessage = "Academic Year is required.")]
        [StringLength(20)]
        public string YearName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Start Date is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End Date is required.")]
        public DateTime EndDate { get; set; }

        public bool IsCurrent { get; set; }

        public bool IsActive { get; set; } = true;

        [ValidateNever]
        public string? CreatedBy { get; set; }

        [ValidateNever]
        public DateTime CreatedDate { get; set; }

        [ValidateNever]
        public string? UpdatedBy { get; set; }

        [ValidateNever]
        public DateTime? UpdatedDate { get; set; }
    }
}
