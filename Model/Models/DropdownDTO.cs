using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models
{
    public class DropdownDTO
    {
        public int Id { get; set; } = default!;
        public string? Code { get; set; }
        public string Text { get; set; } = string.Empty;
    }
}
