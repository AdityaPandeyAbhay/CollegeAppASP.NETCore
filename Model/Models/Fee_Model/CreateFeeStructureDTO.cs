using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Fee_Model
{
    public class CreateFeeStructureDTO
    {
        [Required]
        public int AcademicYearId { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        public int ClassId { get; set; }

        [Required]
        public int FeeCategoryId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        public string? Description { get; set; }
    }
}
