using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Fee_Model
{
    public class FeeCategoryDTO
    {
        [ValidateNever]
        public int Id { get; set; }

        [Required(ErrorMessage = "Category Name is required.")]
        [StringLength(100, ErrorMessage = "Category Name cannot exceed 100 characters.")]
        public string CategoryName { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        [ValidateNever]
        public string? CreatedBy { get; set; }

        [ValidateNever]
        public DateTime CreatedDate { get; set; }

        [ValidateNever]
        public string? ModifiedBy { get; set; }

        [ValidateNever]
        public DateTime? ModifiedDate { get; set; }
    }
}
