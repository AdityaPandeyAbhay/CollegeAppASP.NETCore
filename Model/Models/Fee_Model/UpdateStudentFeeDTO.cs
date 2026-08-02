using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Fee_Model
{
    public class UpdateStudentFeeDTO
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        public int FeeStructureId { get; set; }

        public decimal Discount { get; set; }

        public decimal Fine { get; set; }

        public decimal PaidAmount { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        
    }
}
