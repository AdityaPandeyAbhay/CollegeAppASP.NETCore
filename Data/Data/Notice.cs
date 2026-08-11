using System;

namespace Model.Models.Notice_Model
{
    public class Notice
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        // Original uploaded PDF name
        public string PdfFileName { get; set; } = string.Empty;

        // Relative path of stored PDF
        public string PdfPath { get; set; } = string.Empty;

        // Logged-in user ID
        public string CreatedBy { get; set; } = string.Empty;

        // Notice creation date/time
        public DateTime CreatedDate { get; set; }

        // false = draft, true = published
        public bool IsPublished { get; set; }

        // Null until published
        public DateTime? PublishedDate { get; set; }

        // true = active, false = deactivated
        public bool IsActive { get; set; }
    }
}