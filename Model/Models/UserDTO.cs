using System.ComponentModel.DataAnnotations;

namespace CollegeApp.Models
{
    public class UserDTO
    {
        public string Id { get; set; } 
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;

        public bool IsActive { get; set; } // Indicates if the user is active or not
        [Required]

        public int UserTypeId { get; set; } // 1 for Admin, 2 for Student, 3 for Teacher

        public List<int> RoleIds { get; set; } = new();
    }
}
