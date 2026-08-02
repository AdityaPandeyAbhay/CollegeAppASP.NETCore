using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Fee_Model
{
    public class GetStudentFeeDTO
    {
        public int Id { get; set; }

        public int StudentId { get; set; }

        public string StudentName { get; set; } = string.Empty;

        public int FeeStructureId { get; set; }

        public string InvoiceNo { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public decimal Discount { get; set; }

        public decimal Fine { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal PaidAmount { get; set; }

        public decimal BalanceAmount { get; set; }

        public DateTime DueDate { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
