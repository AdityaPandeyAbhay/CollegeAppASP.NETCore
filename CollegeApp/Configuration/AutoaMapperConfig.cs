using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;

namespace CollegeApp.Configuration
{
    public class AutoMapperConfig : Profile
    {
        public AutoMapperConfig()
        {
            //CreateMap<Student, StudentDTO>(); below code samework as above line but with reverse mapping.
            //CreateMap<StudentDTO, Student>();
            CreateMap<Student, StudentDTO>().ReverseMap();
            CreateMap<Role, RoleDTO>().ReverseMap();
            CreateMap<RolePrivilege, RolePrivilegeDTO>().ReverseMap();
            CreateMap<User, UserDTO>().ReverseMap();
        }
    }
}