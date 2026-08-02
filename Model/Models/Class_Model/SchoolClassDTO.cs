using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Class_Model
{
    public class SchoolClassDTO
    {
        [ValidateNever]
        public int Id { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [ValidateNever]
        public string? DepartmentName { get; set; }

        [Required]
        [StringLength(20)]
        public string ClassCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ClassName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int DisplayOrder { get; set; }

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
