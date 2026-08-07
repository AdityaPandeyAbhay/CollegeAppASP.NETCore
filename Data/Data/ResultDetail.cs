using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace Data.Data
{
    public class ResultDetail
    {
        public int Id { get; set; }

        // Parent Result
        public int ResultId { get; set; }
        public Result Result { get; set; } = null!;

        // Subject
        public int SubjectId { get; set; }
        public Subject Subject { get; set; } = null!;

        // Marks
        public decimal MaxMarks { get; set; }

        public decimal ObtainedMarks { get; set; }

        [MaxLength(5)]
        public string? Grade { get; set; }

        [MaxLength(500)]
        public string? Remarks { get; set; }
    }
}
