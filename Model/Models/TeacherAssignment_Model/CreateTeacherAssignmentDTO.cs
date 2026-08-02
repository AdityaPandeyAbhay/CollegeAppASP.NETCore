using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Model.Models.TeacherAssignment_Model
{
    public class CreateTeacherAssignmentDTO
    {
        [Required]
        public int TeacherId { get; set; }

        [Required]
        public int DepartmentId { get; set; }

        [Required]
        public int SchoolClassId { get; set; }

        [Required]
        public int SectionId { get; set; }

        [Required]
        public int SubjectId { get; set; }

        [Required]
        public int AcademicYearId { get; set; }

        public bool IsClassTeacher { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
