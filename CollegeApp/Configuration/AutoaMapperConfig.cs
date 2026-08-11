
using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Data.Data;
using Model.Models;
using Model.Models.Attendance_Model;
using Model.Models.Class_Model;
using Model.Models.Department_model;
using Model.Models.Fee_Model;
using Model.Models.NonTeachingStaff;
using Model.Models.Notice_Model;
using Model.Models.Result_Model;
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
            // =====================================================
            // Department
            // =====================================================

            CreateMap<Department, GetDepartmentDTO>()
                .ReverseMap();

            CreateMap<Department, CreateDepartmentDTO>()
                .ReverseMap();

            CreateMap<Department, UpdateDepartmentDTO>()
                .ReverseMap();


            // =====================================================
            // Student
            // =====================================================

            CreateMap<Student, CreateStudentDTO>()
                .ReverseMap();

            CreateMap<Student, UpdateStudentDTO>()
                .ReverseMap();

            CreateMap<Student, GetStudentDTO>()
                .ReverseMap();

            CreateMap<Student, PatchStudentDTO>()
                .ReverseMap();


            // =====================================================
            // Role
            // =====================================================

            CreateMap<Role, RoleDTO>()
                .ReverseMap();

            CreateMap<RolePrivilege, RolePrivilegeDTO>()
                .ReverseMap();


            // =====================================================
            // User
            // =====================================================

            CreateMap<User, UserDTO>()
                .ReverseMap();


            // =====================================================
            // Teacher
            // =====================================================

            CreateMap<Teacher, CreateTeacherDTO>()
                .ReverseMap();

            CreateMap<Teacher, UpdateTeacherDTO>()
                .ReverseMap();

            CreateMap<Teacher, GetTeacherDTO>()
                .ReverseMap();


            // =====================================================
            // Non Teaching Staff
            // =====================================================

            CreateMap<NonTeachingStaff, GetNonTeachingStaffDTO>()
                .ReverseMap();

            CreateMap<NonTeachingStaff, CreateNonTeachingStaffDTO>()
                .ReverseMap();

            CreateMap<NonTeachingStaff, UpdateNonTeachingStaffDTO>()
                .ReverseMap();


            // =====================================================
            // Academic Year
            // =====================================================

            CreateMap<AcademicYear, AcademicYearDTO>()
                .ReverseMap();

            CreateMap<AcademicYear, DropdownDTO>()
                .ForMember(dest => dest.Text,
                    opt => opt.MapFrom(src => src.YearName));


            // =====================================================
            // Fee Category
            // =====================================================

            CreateMap<FeeCategory, FeeCategoryDTO>()
                .ReverseMap();


            // =====================================================
            // Fee Structure
            // =====================================================

            CreateMap<FeeStructure, CreateFeeStructureDTO>()
                .ReverseMap();

            CreateMap<FeeStructure, GetFeeStructureDTO>()
                .ForMember(dest => dest.AcademicYearName,
                    opt => opt.MapFrom(src =>
                        src.AcademicYear.YearName))

                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src =>
                        src.Department.DepartmentName))

                .ForMember(dest => dest.ClassName,
                    opt => opt.MapFrom(src =>
                        src.SchoolClass.ClassName))

                .ForMember(dest => dest.FeeCategoryName,
                    opt => opt.MapFrom(src =>
                        src.FeeCategory.CategoryName))

                .ReverseMap();

            CreateMap<FeeStructure, UpdateFeeStructureDTO>()
                .ReverseMap();


            // =====================================================
            // Student Fee
            // =====================================================

            CreateMap<CreateStudentFeeDTO, StudentFee>()
                .ReverseMap();

            CreateMap<UpdateStudentFeeDTO, StudentFee>()
                .ReverseMap();

            CreateMap<StudentFee, GetStudentFeeDTO>()
                .ForMember(dest => dest.StudentName,
                    opt => opt.MapFrom(src =>
                        src.Student.FirstName
                        + " "
                        + (src.Student.MiddleName ?? "")
                        + " "
                        + src.Student.LastName))
                .ReverseMap();


            // =====================================================
            // School Class
            // =====================================================

            CreateMap<SchoolClass, SchoolClassDTO>()
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src =>
                        src.Department != null
                            ? src.Department.DepartmentName
                            : null))
                .ReverseMap();


            // =====================================================
            // Section
            // =====================================================

            CreateMap<CreateSectionDTO, Section>()
                .ReverseMap();

            CreateMap<UpdateSectionDTO, Section>()
                .ReverseMap();

            CreateMap<Section, GetSectionDTO>()
                .ForMember(dest => dest.ClassName,
                    opt => opt.MapFrom(src =>
                        src.SchoolClass != null
                            ? src.SchoolClass.ClassName
                            : string.Empty))
                .ReverseMap();


            // =====================================================
            // Subject
            // =====================================================

            CreateMap<CreateSubjectDTO, Subject>()
                .ReverseMap();

            CreateMap<UpdateSubjectDTO, Subject>()
                .ReverseMap();

            CreateMap<Subject, GetSubjectDTO>()
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src =>
                        src.Department != null
                            ? src.Department.DepartmentName
                            : string.Empty))
                .ReverseMap();


            // =====================================================
            // Teacher Assignment
            // =====================================================

            CreateMap<CreateTeacherAssignmentDTO, TeacherAssignment>()
                .ReverseMap();

            CreateMap<UpdateTeacherAssignmentDTO, TeacherAssignment>()
                .ReverseMap();

            CreateMap<TeacherAssignment, GetTeacherAssignmentDTO>()
                .ForMember(dest => dest.TeacherName,
                    opt => opt.MapFrom(src =>
                        src.Teacher.FirstName
                        + " "
                        + (src.Teacher.MiddleName ?? "")
                        + " "
                        + src.Teacher.LastName))

                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src =>
                        src.Department.DepartmentName))

                .ForMember(dest => dest.ClassName,
                    opt => opt.MapFrom(src =>
                        src.SchoolClass.ClassName))

                .ForMember(dest => dest.SectionName,
                    opt => opt.MapFrom(src =>
                        src.Section.SectionName))

                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src =>
                        src.Subject.SubjectName))

                .ForMember(dest => dest.AcademicYear,
                    opt => opt.MapFrom(src =>
                        src.AcademicYear.YearName))

                .ReverseMap();


            // =====================================================
            // Exam
            // =====================================================

            CreateMap<CreateExamDTO, Exam>();

            CreateMap<UpdateExamDTO, Exam>();

            CreateMap<Exam, ExamResponseDTO>();

            CreateMap<Exam, ExamDropdownDTO>();


            // =====================================================
            // Result Batch
            // =====================================================

            CreateMap<CreateResultBatchDTO, ResultBatch>()
                .ForMember(dest => dest.Results,
                    opt => opt.Ignore());

            CreateMap<ResultBatch, ResultBatchResponseDTO>()
                .ForMember(dest => dest.AcademicYear,
                    opt => opt.MapFrom(src =>
                        src.AcademicYear.YearName))

                .ForMember(dest => dest.ClassName,
                    opt => opt.MapFrom(src =>
                        src.SchoolClass.ClassName))

                .ForMember(dest => dest.SectionName,
                    opt => opt.MapFrom(src =>
                        src.Section.SectionName))

                .ForMember(dest => dest.ExamName,
                    opt => opt.MapFrom(src =>
                        src.Exam.ExamName));


            // =====================================================
            // Result
            // =====================================================

            CreateMap<Result, StudentResultDTO>()

                .ForMember(dest => dest.ResultId,
                    opt => opt.MapFrom(src =>
                        src.Id))

                .ForMember(dest => dest.StudentId,
                    opt => opt.MapFrom(src =>
                        src.StudentId))

                .ForMember(dest => dest.StudentName,
                    opt => opt.MapFrom(src =>
                        src.Student.FirstName
                        + " "
                        + src.Student.LastName))

                .ForMember(dest => dest.AdmissionNumber,
                    opt => opt.MapFrom(src =>
                        src.Student.AdmissionNumber))

                .ForMember(dest => dest.Subjects,
                    opt => opt.MapFrom(src =>
                        src.ResultDetails));


            CreateMap<StudentResultDTO, Result>()

                .ForMember(dest => dest.Id,
                    opt => opt.MapFrom(src =>
                        src.ResultId))

                .ForMember(dest => dest.Student,
                    opt => opt.Ignore())

                .ForMember(dest => dest.ResultBatch,
                    opt => opt.Ignore())

                .ForMember(dest => dest.ResultDetails,
                    opt => opt.Ignore());


            // =====================================================
            // Result Detail
            // =====================================================

            CreateMap<ResultDetail, ResultDetailDTO>()

                .ForMember(dest => dest.SubjectName,
                    opt => opt.MapFrom(src =>
                        src.Subject.SubjectName));


            CreateMap<ResultDetailDTO, ResultDetail>()

                .ForMember(dest => dest.Id,
                    opt => opt.Ignore())

                .ForMember(dest => dest.Result,
                    opt => opt.Ignore())

                .ForMember(dest => dest.Subject,
                    opt => opt.Ignore());


            // =====================================================
            // Result Upload
            // =====================================================

            CreateMap<ResultUploadDTO, Result>()

                .ForMember(dest => dest.Id,
                    opt => opt.MapFrom(src =>
                        src.ResultId))

                .ForMember(dest => dest.ResultDetails,
                    opt => opt.Ignore());


            // =====================================================
            // Student Mark
            // =====================================================

            CreateMap<StudentMarkDTO, Result>()

                .ForMember(dest => dest.Id,
                    opt => opt.Ignore())

                .ForMember(dest => dest.ResultDetails,
                    opt => opt.Ignore());


            // =====================================================
            // Attendance
            // =====================================================

            // -----------------------------------------------------
            // Attendance -> AttendanceResponseDTO
            // -----------------------------------------------------

            CreateMap<Attendance, AttendanceResponseDTO>()

                .ForMember(dest => dest.AttendanceId,
                    opt => opt.MapFrom(src =>
                        src.Id))

                .ForMember(dest => dest.Students,
                    opt => opt.MapFrom(src =>
                        src.AttendanceDetails));


            // -----------------------------------------------------
            // AttendanceDetail -> AttendanceStudentDTO
            // -----------------------------------------------------

            CreateMap<AttendanceDetail, AttendanceStudentDTO>()

                // SrNo is UI-only.
                // It is not stored in database.
                .ForMember(dest => dest.SrNo,
                    opt => opt.Ignore())

                .ForMember(dest => dest.StudentId,
                    opt => opt.MapFrom(src =>
                        src.StudentId))

                .ForMember(dest => dest.AdmissionNumber,
                    opt => opt.MapFrom(src =>
                        src.Student.AdmissionNumber))

                .ForMember(dest => dest.StudentName,
                    opt => opt.MapFrom(src =>
                        src.Student.FirstName
                        + " "
                        + (src.Student.MiddleName ?? "")
                        + " "
                        + src.Student.LastName))

                .ForMember(dest => dest.AttendanceStatus,
                    opt => opt.MapFrom(src =>
                        src.AttendanceStatus))

                .ForMember(dest => dest.Remarks,
                    opt => opt.MapFrom(src =>
                        src.Remarks));


            // -----------------------------------------------------
            // Notice -> NoticeDTO
            // -----------------------------------------------------

            CreateMap<CreateNoticeDTO, Notice>()
                .ForMember(dest => dest.PdfFileName,
                    opt => opt.Ignore())
                .ForMember(dest => dest.PdfPath,
                    opt => opt.Ignore())
                .ForMember(dest => dest.CreatedBy,
                    opt => opt.Ignore())
                .ForMember(dest => dest.CreatedDate,
                    opt => opt.Ignore())
                .ForMember(dest => dest.IsPublished,
                    opt => opt.Ignore())
                .ForMember(dest => dest.PublishedDate,
                    opt => opt.Ignore())
                .ForMember(dest => dest.IsActive,
                    opt => opt.Ignore());

            CreateMap<Notice, GetNoticeDTO>();

            CreateMap<Notice, NonPublishedNoticeDTO>();
        }
    }
}

