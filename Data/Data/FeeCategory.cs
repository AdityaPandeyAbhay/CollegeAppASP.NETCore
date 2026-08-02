using System;
using System.Collections.Generic;
using System.Text;
namespace Data.Data
{
    public class FeeCategory
    {
        public int Id { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public string? ModifiedBy { get; set; }

        public DateTime? ModifiedDate { get; set; }

        public virtual ICollection<FeeStructure> FeeStructures { get; set; }
            = new List<FeeStructure>();
    }
}