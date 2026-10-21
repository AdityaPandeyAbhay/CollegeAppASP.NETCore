using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Models.Student_Model
{
    public class PatchStudentDTO
    {
        public string? FirstName { get; set; }

        public string? MiddleName { get; set; }

        public string? LastName { get; set; }

        public string? FatherName { get; set; }

        public string? MotherName { get; set; }

        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? AlternatePhoneNumber { get; set; }

        public string? Address { get; set; }

        public bool IsActive { get; set; }
    }
}
