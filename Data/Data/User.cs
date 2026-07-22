namespace CollegeApp.Data
{
    public class User
    {
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

    }
}
