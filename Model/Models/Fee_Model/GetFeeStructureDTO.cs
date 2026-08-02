using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Fee_Model
{
    public class GetFeeStructureDTO
    {
        public int Id { get; set; }

        public int AcademicYearId { get; set; }
        public string AcademicYearName { get; set; } = string.Empty;

        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;

        public int ClassId { get; set; }
        public string ClassName { get; set; } = string.Empty;

        public int FeeCategoryId { get; set; }
        public string FeeCategoryName { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }
    }
}
