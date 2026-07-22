using CollegeApp.Data.Config;
using CollegeApp.Models;          // Change this if Student is in a different namespace
using Microsoft.EntityFrameworkCore;

namespace CollegeApp.Data
{
    public class CollegeDBContext : DbContext
    {
        public CollegeDBContext(DbContextOptions<CollegeDBContext> options)
            : base(options)
        {
        }

        // DbSet
        public DbSet<Student> Students { get; set; }
        public DbSet<Department> Department { get; set; }

        public DbSet<User> Users { get; set; } // Add this line for the User entity
        public DbSet<Role> Roles { get; set; }
        public DbSet<RolePrivilege> RolePrivileges { get; set; }
        public DbSet<UserRoleMapping> UserRoleMappings { get; set; } // Add this line for the UserRoleMapping entity

        public DbSet<UserType> UserTypes { get; set; } // Add this line for the UserType entity

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new StudentConfig());
            modelBuilder.ApplyConfiguration(new DepartmentConfig());
            modelBuilder.ApplyConfiguration(new UserConfig());
            modelBuilder.ApplyConfiguration(new RoleConfig());
            modelBuilder.ApplyConfiguration(new RolePrivilegeConfig());
            modelBuilder.ApplyConfiguration(new UserRoleMappingConfig());
            modelBuilder.ApplyConfiguration(new UserTypeConfig()); // Add this line for the UserType entity
        }
    }
}