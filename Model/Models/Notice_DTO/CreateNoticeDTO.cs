using System;
using System.Collections.Generic;
using System.Text;



using Microsoft.AspNetCore.Http;

namespace Model.Models.Notice_Model
{
    public class CreateNoticeDTO
    {
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public IFormFile? PdfFile { get; set; }
    }
}


