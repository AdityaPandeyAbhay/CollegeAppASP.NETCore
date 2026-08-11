using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.AspNetCore.Http;

namespace Model.Models.Notice_Model
{
    public class GetNoticeDTO
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string PdfFileName { get; set; } = string.Empty;

        public string PdfPath { get; set; } = string.Empty;

        public string CreatedBy { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }

        public bool IsPublished { get; set; }

        public DateTime? PublishedDate { get; set; }

        public bool IsActive { get; set; }
    }
}