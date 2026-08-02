using Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Data.Data
{
    public class FeeStructure
    {
        public int Id { get; set; }

        public int AcademicYearId { get; set; }
        public virtual AcademicYear AcademicYear { get; set; } = null!;

        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; } = null!;

        public int ClassId { get; set; }
        public virtual SchoolClass SchoolClass { get; set; } = null!;

        public int FeeCategoryId { get; set; }
        public virtual FeeCategory FeeCategory { get; set; } = null!;

        public decimal Amount { get; set; }

        public DateTime DueDate { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        public virtual ICollection<StudentFee> StudentFees { get; set; }
            = new List<StudentFee>();
    }
}
