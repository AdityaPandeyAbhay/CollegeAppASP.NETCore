using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace CollegeApp.Data.Config
{
    public class DepartmentConfig : IEntityTypeConfiguration<Department>
    {
        public void Configure(EntityTypeBuilder<Department> builder)
        {
            builder.ToTable("Department");
            builder.HasKey(d => d.Id);
            builder.Property(d => d.Id).UseIdentityColumn();
            builder.Property(d => d.DepartmentName).IsRequired().IsRequired();
            builder.Property(d => d.DepartmentName).HasMaxLength(100);
            builder.Property(d => d.Desciption).HasMaxLength(500).IsRequired(false);


            builder.HasData(new Department 
            { 
                Id = 1, DepartmentName = "Computer Science", Desciption = "Department of Computer Science" },
                new Department { 
                    Id = 2, DepartmentName = "Mathematics", Desciption = "Department of Mathematics"
                },
                new Department { 
                    Id = 3, DepartmentName = "Physics", Desciption = "Department of Physics" 
                }
            );

        }

    }
}
