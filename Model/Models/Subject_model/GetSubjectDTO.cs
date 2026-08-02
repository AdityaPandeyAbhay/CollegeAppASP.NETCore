using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Subject_model
{
    public class GetSubjectDTO
    {
        public int Id { get; set; }

        public int DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        public string SubjectCode { get; set; } = string.Empty;

        public string SubjectName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int TheoryMarks { get; set; }

        public int PracticalMarks { get; set; }

        public bool IsOptional { get; set; }

        public bool IsActive { get; set; }
    }
}
