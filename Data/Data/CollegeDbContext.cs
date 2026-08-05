using CollegeApp.Data.Config;
using CollegeApp.Models;          // Change this if Student is in a different namespace
using Data.Config;
using Data.Configuration;
using Data.Data;
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
        public DbSet<Teacher> Teachers { get; set; } // Add this line for the Teachers entity

        public DbSet<NonTeachingStaff> NonTeachingStaffs { get; set; }

        public DbSet<TeacherAssignment> TeacherAssignments { get; set; }
        public DbSet<AcademicYear> AcademicYears { get; set; }
        public DbSet<Subject> Subjects { get; set; }
        public DbSet<Section> Sections { get; set; }
        public DbSet<SchoolClass> Classes { get; set; }
        public DbSet<FeeCategory> FeeCategories  { get; set; }
        public DbSet<FeeStructure> feeStructures  { get; set; }
        public DbSet<StudentFee> studentFees  { get; set; }

        public DbSet<Attendance> Attendances { get; set; }

        public DbSet<AttendanceDetail> AttendanceDetails { get; set; }


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
            modelBuilder.ApplyConfiguration(new TeacherConfig());
            modelBuilder.ApplyConfiguration(new NonTeachingStaffConfig());
            modelBuilder.ApplyConfiguration(new SchoolClassConfig());
            modelBuilder.ApplyConfiguration(new SubjectConfig());
            modelBuilder.ApplyConfiguration(new TeacherAssignmentConfig());
            modelBuilder.ApplyConfiguration(new AcademicYearConfig());
            modelBuilder.ApplyConfiguration(new SectionConfig());
            modelBuilder.ApplyConfiguration(new FeeCategoryConfig());
            modelBuilder.ApplyConfiguration(new FeeStructureConfig());
            modelBuilder.ApplyConfiguration(new StudentFeeConfig());
            modelBuilder.ApplyConfiguration(new AttendanceConfig());
            modelBuilder.ApplyConfiguration(new AttendanceDetailConfig());


        }
    }
}