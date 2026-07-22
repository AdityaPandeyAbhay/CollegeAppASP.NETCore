namespace CollegeApp.Data
{
    public class UserRoleMapping
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public int RoleId { get; set; }

        // Navigation Properties
        public virtual User User { get; set; } = null!;

        public virtual Role Role { get; set; } = null!;
    }
}