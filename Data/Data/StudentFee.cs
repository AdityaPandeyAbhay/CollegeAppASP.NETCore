using System;
using System.Collections.Generic;
using System.Text;

namespace Data.Data
{
    public class StudentFee
    {
        public int Id { get; set; }

        public int StudentId { get; set; }
        public virtual Student Student { get; set; } = null!;

        public int FeeStructureId { get; set; }
        public virtual FeeStructure FeeStructure { get; set; } = null!;

        public string InvoiceNo { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public decimal Discount { get; set; }

        public decimal Fine { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal PaidAmount { get; set; }

        public decimal BalanceAmount { get; set; }

        public DateTime DueDate { get; set; }

        public string Status { get; set; } = "Pending";

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }
    }
}
