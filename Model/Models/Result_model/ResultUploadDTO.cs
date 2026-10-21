using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.Result_Model
{
    public class ResultUploadDTO
    {
        public int ResultId { get; set; }   // 0 = Create, >0 = Update

        [Required]
        public int ResultBatchId { get; set; }

        [Required]
        public int StudentId { get; set; }

        public List<ResultDetailDTO> Subjects { get; set; } = new();
        // Result PDF
        public IFormFile? PdfFile { get; set; }



    }
}
