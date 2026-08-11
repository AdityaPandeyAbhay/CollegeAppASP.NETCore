using System;
using System.Collections.Generic;
using System.Text;


namespace Model.Models.Notice_Model
{
    public class NonPublishedNoticeDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedDate { get; set; }
    }
}