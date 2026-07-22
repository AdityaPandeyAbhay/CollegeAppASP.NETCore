using System.ComponentModel.DataAnnotations;

namespace CollegeApp.Models
{
    public class RolePrivilegeDTO
    {
        public int Id { get; set; }
        [Required]
        public string RolePrivilegeName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
       
        [Required]
       

        public bool IsActive { get; set; }
        
        public int RoleId { get; set; }

    }
}
