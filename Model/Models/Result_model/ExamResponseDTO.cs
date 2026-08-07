using System;
using System.Collections.Generic;
using System.Text;

using System;

namespace Model.Models.Result_Model
{
    public class ExamResponseDTO
    {
        public int Id { get; set; }

        public string ExamName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public bool IsActive { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}