using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Data.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Model.Models;
using Model.Models.Class_Model;
using Model.Models.Department_model;
using Model.Models.Fee_Model;
using Model.Models.NonTeachingStaff;
using Model.Models.Student_Model;
using Model.Models.Subject_model;
using Model.Models.Teacher_Model;
using Model.Models.TeacherAssignment_Model;

namespace CollegeApp.Configuration
{
    public class AutoMapperConfig : Profile
    {
        public AutoMapperConfig()
        {
            //CreateMap<Student, StudentDTO>(); below code samework as above line but with reverse mapping.
            //CreateMap<StudentDTO, Student>();

            //Department
            CreateMap<Department, GetDepartmentDTO>().ReverseMap();

            CreateMap<Department, CreateDepartmentDTO>().ReverseMap();

            CreateMap<Department, UpdateDepartmentDTO>().ReverseMap();


            //Student
            CreateMap<Student, CreateStudentDTO>().ReverseMap();

            CreateMap<Student, UpdateStudentDTO>().ReverseMap();
            
            CreateMap<Student, GetStudentDTO>().ReverseMap();
            
            CreateMap<Student, PatchStudentDTO>().ReverseMap();

            //Role
            
            CreateMap<Role, RoleDTO>().ReverseMap();
            
            CreateMap<RolePrivilege, RolePrivilegeDTO>().ReverseMap();

            //User

            CreateMap<User, UserDTO>().ReverseMap();

            //Teacher
            
            CreateMap<Teacher, CreateTeacherDTO>().ReverseMap();
            
            CreateMap<Teacher, UpdateTeacherDTO>().ReverseMap();
            
            CreateMap<Teacher, GetTeacherDTO>().ReverseMap();

            //Non Teaching Staff
            
            CreateMap<NonTeachingStaff, GetNonTeachingStaffDTO>().ReverseMap();
            
            CreateMap<NonTeachingStaff, CreateNonTeachingStaffDTO>().ReverseMap();
            
            CreateMap<NonTeachingStaff, UpdateNonTeachingStaffDTO>().ReverseMap();

            // Academic Year
            CreateMap<AcademicYear, AcademicYearDTO>().ReverseMap();
            CreateMap<AcademicYear, DropdownDTO>()
                    .ForMember(dest => dest.Text,
                     opt => opt.MapFrom(src => src.YearName));


            //. Fee 
            //Category

            CreateMap<FeeCategory, FeeCategoryDTO>().ReverseMap();

            //Stucture
            CreateMap<FeeStructure, CreateFeeStructureDTO>().ReverseMap();

            CreateMap<FeeStructure, GetFeeStructureDTO>()
                .ForMember(d => d.AcademicYearName, o => o.MapFrom(s => s.AcademicYear.YearName))
                .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Department.DepartmentName))
                .ForMember(d => d.ClassName, o => o.MapFrom(s => s.SchoolClass.ClassName))
                .ForMember(d => d.FeeCategoryName, o => o.MapFrom(s => s.FeeCategory.CategoryName)).ReverseMap();

            CreateMap<FeeStructure, UpdateFeeStructureDTO>().ReverseMap();

            // StudentFee Mapping

            CreateMap<CreateStudentFeeDTO, StudentFee>().ReverseMap();

            CreateMap<UpdateStudentFeeDTO, StudentFee>().ReverseMap();

            CreateMap<StudentFee, GetStudentFeeDTO>()
                .ForMember(dest => dest.StudentName,
                    opt => opt.MapFrom(src =>
                        src.Student.FirstName + " " +
                        (src.Student.MiddleName ?? "") + " " +
                        src.Student.LastName)).ReverseMap();

           
           




            // Class related 

            CreateMap<SchoolClass, SchoolClassDTO>()
            .ForMember(dest => dest.DepartmentName,
             opt => opt.MapFrom(src => src.Department != null ? src.Department.DepartmentName : null))
            .ReverseMap();


            // =========================
            // Section Mapping
            // =========================

            // Create
            CreateMap<CreateSectionDTO, Section>().ReverseMap();

            // Update
            CreateMap<UpdateSectionDTO, Section>().ReverseMap();

            // Get
            CreateMap<Section, GetSectionDTO>()
                .ForMember(dest => dest.ClassName,
                    opt => opt.MapFrom(src => src.SchoolClass != null
                        ? src.SchoolClass.ClassName
                        : string.Empty)).ReverseMap();


            // =====================
            // Subject Mapping
            // =====================

            CreateMap<CreateSubjectDTO, Subject>().ReverseMap();

            CreateMap<UpdateSubjectDTO, Subject>().ReverseMap();

            CreateMap<Subject, GetSubjectDTO>()
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.Department != null
                        ? src.Department.DepartmentName
                        : string.Empty)).ReverseMap();



            //=============================
            // Teacher Assignment Mapping
            //=============================

            CreateMap<CreateTeacherAssignmentDTO, TeacherAssignment>().ReverseMap();

            CreateMap<UpdateTeacherAssignmentDTO, TeacherAssignment>().ReverseMap();

            CreateMap<TeacherAssignment, GetTeacherAssignmentDTO>()
                .ForMember(dest => dest.TeacherName,
                    opt => opt.MapFrom(src =>
                        src.Teacher.FirstName + " " +
                        (src.Teacher.MiddleName ?? "") + " " +
                        src.Teacher.LastName))

                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.Department.DepartmentName))

                .ForMember(dest => dest.ClassName,
                    opt => opt.MapFrom(src => src.SchoolClass.ClassName))

                .ForMember(dest => dest.SectionName,
                    opt => opt.MapFrom(src => src.Section.SectionName))

                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src => src.Subject.SubjectName))

                .ForMember(dest => dest.AcademicYear,
                    opt => opt.MapFrom(src => src.AcademicYear.YearName)).ReverseMap();



        }
    }
}