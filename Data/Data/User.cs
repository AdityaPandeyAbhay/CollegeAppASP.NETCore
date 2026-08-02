using Data.Data;
using System.ComponentModel.DataAnnotations;

namespace CollegeApp.Data
{
    public class User
    {
        [StringLength(450)]
        public string Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PasswordSalt { get; set; } = string.Empty;


        public int UserTypeId { get; set; }// 1 for Admin, 2 for Student, 3 for Teacher

       public bool IsActive { get; set; } 
        // Indicates if the user is active or not

        
       public bool IsDeleted { get; set; } // Indicates if the user is deleted or not
        public DateTime CreatedDate { get; set; }

        public DateTime ModifyDate { get; set; } // Indicates when the user was last modified 

        public virtual UserType UserType { get; set; } // Navigation property for user type

        public virtual ICollection<UserRoleMapping> UserRoleMappings { get; set; } // Navigation property for user-role mappings

        // Teacher account
        public virtual Teacher? Teacher { get; set; }

        // Audit
        public virtual ICollection<Teacher> CreatedTeachers { get; set; } = new List<Teacher>();

        public virtual ICollection<Teacher> UpdatedTeachers { get; set; } = new List<Teacher>();

        public virtual NonTeachingStaff? NonTeachingStaff { get; set; }

    }
}
