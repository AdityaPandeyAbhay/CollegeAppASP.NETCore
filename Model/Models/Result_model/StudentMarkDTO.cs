using System;
using System.Collections.Generic;
using System.Text;

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Model.Models.Result_Model
{
    public class StudentMarkDTO
    {
        [Required]
        public int StudentId { get; set; }

        public List<ResultDetailDTO> Subjects { get; set; } = new();
    }
}