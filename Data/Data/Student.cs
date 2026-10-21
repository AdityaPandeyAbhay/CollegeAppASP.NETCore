using CollegeApp.Data;

namespace Data.Data
{
    public class Student
    {
        public int Id { get; set; }

        // Login User
        public string UserId { get; set; } = string.Empty;
        public virtual User User { get; set; } = null!;

        // Department
        public int DepartmentId { get; set; }
        public virtual Department Department { get; set; } = null!;

        // Class
        public int SchoolClassId { get; set; }

        public virtual SchoolClass SchoolClass { get; set; } = null!;


        // Section
        public int SectionId { get; set; }

        public virtual Section Section { get; set; } = null!;

        // Admission
        public string AdmissionNumber { get; set; } = string.Empty;

        public DateTime AdmissionDate { get; set; }

        // Personal Details
        public string FirstName { get; set; } = string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } = string.Empty;

        public string? FatherName { get; set; }

        public string? MotherName { get; set; }

        public DateTime DOB { get; set; }

        public string Gender { get; set; } = string.Empty;

        public string? BloodGroup { get; set; }

        public string? Photo { get; set; }

        public string? AadhaarNumber { get; set; }

        public string? Religion { get; set; }

        public string? Category { get; set; }

        public string? Nationality { get; set; }

        // Contact
        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string? AlternatePhoneNumber { get; set; }

        public string Address { get; set; } = string.Empty;

        // Status
        public bool IsActive { get; set; } = true;

        // Audit
        public string CreatedBy { get; set; } = string.Empty;
        public virtual User CreatedByUser { get; set; } = null!;

        public DateTime CreatedDate { get; set; }

        public string? UpdatedBy { get; set; }
        public virtual User? UpdatedByUser { get; set; }

        public DateTime? UpdatedDate { get; set; }

        // Navigation

        public virtual ICollection<StudentFee> StudentFees { get; set; }
               = new List<StudentFee>();
        public virtual ICollection<StudentAcademicYear> StudentAcademicYears { get; set; }
            = new List<StudentAcademicYear>();

        //public virtual ICollection<StudentFee> StudentFees { get; set; }
        //    = new List<StudentFee>();

        //public virtual ICollection<AttendanceDetail> AttendanceDetails { get; set; }
        //    = new List<AttendanceDetail>();

        //public virtual ICollection<Result> Results { get; set; }
        //    = new List<Result>();

        //public virtual ICollection<StudentParent> StudentParents { get; set; }
        //    = new List<StudentParent>();

        //public virtual ICollection<Document> Documents { get; set; }
        //    = new List<Document>();

        public virtual ICollection<AttendanceDetail> AttendanceDetails { get; set; }
         = new List<AttendanceDetail>();
        public ICollection<Result> Results { get; set; }
            = new List<Result>();
    }
}