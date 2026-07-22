using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CollegeApp.Data
{
    public class Student
    {
       
        
        public int Id { get; set; }
        public required string StudentName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        public DateTime DOB { get; set; }

        public int? DepartmentId { get; set; }

        public virtual Department? Department { get; set; }




    }
}
