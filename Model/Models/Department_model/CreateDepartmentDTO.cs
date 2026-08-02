using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Department_model
{
    public class CreateDepartmentDTO
    {
        [Required]
        [StringLength(20)]
        public string DepartmentCode { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string DepartmentName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int DisplayOrder { get; set; }
    }
}
