using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Class_Model
{
    public class GetSectionDTO
    {
        public int Id { get; set; }

        public int SchoolClassId { get; set; }

        public string ClassName { get; set; } = string.Empty;

        public string SectionCode { get; set; } = string.Empty;

        public string SectionName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; } = 1;

        public int Capacity { get; set; }

        public string? RoomNumber { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}
