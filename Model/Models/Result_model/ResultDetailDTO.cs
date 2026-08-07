using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;


namespace Model.Models.Result_Model
{
    public class ResultDetailDTO
    {
        [Required]
        public int SubjectId { get; set; }

        public string SubjectName { get; set; } = string.Empty;


        [Required]
        public decimal MaxMarks { get; set; }


        [Required]
        public decimal ObtainedMarks { get; set; }


        public string? Grade { get; set; }


        public string? Remarks { get; set; }
    }
}
