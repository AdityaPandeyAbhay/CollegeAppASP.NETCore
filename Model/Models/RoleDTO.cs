using System.ComponentModel.DataAnnotations;
namespace CollegeApp.Models
{
    public class RoleDTO
    {
        public int Id { get; set; }
        [Required]
        public string RoleName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [Required]
        public bool IsActive { get; set; }

    }
}
