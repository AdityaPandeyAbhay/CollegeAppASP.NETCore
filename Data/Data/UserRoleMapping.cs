using System.ComponentModel.DataAnnotations;

namespace CollegeApp.Data
{
    public class UserRoleMapping
    {
        public int Id { get; set; }
        [StringLength(450)]
        public string UserId { get; set; } = string.Empty;

        public int RoleId { get; set; }

        // Navigation Properties
        public virtual User User { get; set; } = null!;

        public virtual Role Role { get; set; } = null!;
    }
}