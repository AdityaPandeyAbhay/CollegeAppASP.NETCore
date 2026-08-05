using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Class_Model
{
    public class UpdateSectionDTO
    {
        [Required]
        public int SchoolClassId { get; set; }

        [Required]
        [StringLength(20)]
        public string SectionCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string SectionName { get; set; } = string.Empty;
        public int DisplayOrder { get; set; } = 1;

        [Range(1, 500)]
        public int Capacity { get; set; }

        public string? RoomNumber { get; set; }

        public string? Description { get; set; }

        public bool IsActive { get; set; }
    }
}
