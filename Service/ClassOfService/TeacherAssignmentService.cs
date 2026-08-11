using AutoMapper;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Model.Models;
using Model.Models.TeacherAssignment_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class TeacherAssignmentService : ITeacherAssignmentService
    {
        private readonly ITeacherAssignmentRepository _teacherAssignmentRepository;
        private readonly ITeacherRepository _teacherRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly ISchoolClassRepository _classRepository;
        private readonly ISectionRepository _sectionRepository;
        private readonly ISubjectRepository _subjectRepository;
        private readonly IAcademicYearRepository _academicYearRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public TeacherAssignmentService(
            ITeacherAssignmentRepository teacherAssignmentRepository,
            ITeacherRepository teacherRepository,
            IDepartmentRepository departmentRepository,
            ISchoolClassRepository classRepository,
            ISectionRepository sectionRepository,
            ISubjectRepository subjectRepository,
            IAcademicYearRepository academicYearRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _teacherAssignmentRepository = teacherAssignmentRepository;
            _teacherRepository = teacherRepository;
            _departmentRepository = departmentRepository;
            _classRepository = classRepository;
            _sectionRepository = sectionRepository;
            _subjectRepository = subjectRepository;
            _academicYearRepository = academicYearRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<GetTeacherAssignmentDTO> CreateTeacherAssignmentAsync(CreateTeacherAssignmentDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var teacher = await _teacherRepository.GetAsync(x => x.Id == dto.TeacherId);
            if (teacher == null)
                throw new Exception("Teacher not found.");

            var department = await _departmentRepository.GetAsync(x => x.Id == dto.DepartmentId);
            if (department == null)
                throw new Exception("Department not found.");

            var schoolClass = await _classRepository.GetAsync(x => x.Id == dto.SchoolClassId);
            if (schoolClass == null)
                throw new Exception("Class not found.");

            var section = await _sectionRepository.GetAsync(x => x.Id == dto.SectionId);
            if (section == null)
                throw new Exception("Section not found.");

            var subject = await _subjectRepository.GetAsync(x => x.Id == dto.SubjectId);
            if (subject == null)
                throw new Exception("Subject not found.");

            var academicYear = await _academicYearRepository.GetAsync(x => x.Id == dto.AcademicYearId);
            if (academicYear == null)
                throw new Exception("Academic Year not found.");

            var assignmentExists = await _teacherAssignmentRepository.GetAllByFilterAsync(x =>
                x.TeacherId == dto.TeacherId &&
                x.DepartmentId == dto.DepartmentId &&
                x.SchoolClassId == dto.SchoolClassId &&
                x.SectionId == dto.SectionId &&
                x.SubjectId == dto.SubjectId &&
                x.AcademicYearId == dto.AcademicYearId);

            if (assignmentExists.Any())
            {
                throw new Exception("Teacher Assignment already exists.");
            }

            // Only one Class Teacher per Class + Section + Academic Year
            if (dto.IsClassTeacher)
            {
                var classTeacherExists = await _teacherAssignmentRepository.GetAllByFilterAsync(x =>
                    x.SchoolClassId == dto.SchoolClassId &&
                    x.SectionId == dto.SectionId &&
                    x.AcademicYearId == dto.AcademicYearId &&
                    x.IsClassTeacher);

                if (classTeacherExists.Any())
                {
                    throw new Exception("Class Teacher already assigned.");
                }
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var assignment = _mapper.Map<TeacherAssignment>(dto);

            assignment.CreatedBy = currentUserId;
            assignment.CreatedDate = DateTime.UtcNow;
            assignment.UpdatedBy = currentUserId;
            assignment.UpdatedDate = DateTime.UtcNow;

            await _teacherAssignmentRepository.CreateAsync(assignment);

            return _mapper.Map<GetTeacherAssignmentDTO>(assignment);
        }

        public async Task<List<GetTeacherAssignmentDTO>> GetAllTeacherAssignmentAsync()
        {
            var assignments = await _teacherAssignmentRepository.GetAllAsync();

            return _mapper.Map<List<GetTeacherAssignmentDTO>>(assignments);
        }

        public async Task<GetTeacherAssignmentDTO> GetTeacherAssignmentByIdAsync(int id)
        {
            var assignment = await _teacherAssignmentRepository.GetAsync(
                x => x.Id == id,
                true);

            if (assignment == null)
            {
                throw new Exception($"Teacher Assignment not found with Id : {id}");
            }

            return _mapper.Map<GetTeacherAssignmentDTO>(assignment);
        }

        public async Task<List<GetTeacherAssignmentDTO>> GetTeacherAssignmentByTeacherAsync(int teacherId)
        {
            var assignments = await _teacherAssignmentRepository.GetAllByFilterAsync(
                x => x.TeacherId == teacherId);

            return _mapper.Map<List<GetTeacherAssignmentDTO>>(assignments);
        }

        public async Task<List<GetTeacherAssignmentDTO>> GetTeacherAssignmentByClassAsync(int classId)
        {
            var assignments = await _teacherAssignmentRepository.GetAllByFilterAsync(
                x => x.SchoolClassId == classId);

            return _mapper.Map<List<GetTeacherAssignmentDTO>>(assignments);
        }

        public async Task<List<GetTeacherAssignmentDTO>> GetTeacherAssignmentBySubjectAsync(int subjectId)
        {
            var assignments = await _teacherAssignmentRepository.GetAllByFilterAsync(
                x => x.SubjectId == subjectId);

            return _mapper.Map<List<GetTeacherAssignmentDTO>>(assignments);
        }

        public async Task<bool> UpdateTeacherAssignmentAsync(int id, UpdateTeacherAssignmentDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var assignment = await _teacherAssignmentRepository.GetAsync(x => x.Id == id);

            if (assignment == null)
            {
                throw new Exception($"Teacher Assignment not found with Id : {id}");
            }

            var teacher = await _teacherRepository.GetAsync(x => x.Id == dto.TeacherId);
            if (teacher == null)
                throw new Exception("Teacher not found.");

            var department = await _departmentRepository.GetAsync(x => x.Id == dto.DepartmentId);
            if (department == null)
                throw new Exception("Department not found.");

            var schoolClass = await _classRepository.GetAsync(x => x.Id == dto.SchoolClassId);
            if (schoolClass == null)
                throw new Exception("Class not found.");

            var section = await _sectionRepository.GetAsync(x => x.Id == dto.SectionId);
            if (section == null)
                throw new Exception("Section not found.");

            var subject = await _subjectRepository.GetAsync(x => x.Id == dto.SubjectId);
            if (subject == null)
                throw new Exception("Subject not found.");

            var academicYear = await _academicYearRepository.GetAsync(x => x.Id == dto.AcademicYearId);
            if (academicYear == null)
                throw new Exception("Academic Year not found.");

            var duplicate = await _teacherAssignmentRepository.GetAllByFilterAsync(x =>
                x.Id != id &&
                x.TeacherId == dto.TeacherId &&
                x.DepartmentId == dto.DepartmentId &&
                x.SchoolClassId == dto.SchoolClassId &&
                x.SectionId == dto.SectionId &&
                x.SubjectId == dto.SubjectId &&
                x.AcademicYearId == dto.AcademicYearId);

            if (duplicate.Any())
            {
                throw new Exception("Teacher Assignment already exists.");
            }

            if (dto.IsClassTeacher)
            {
                var classTeacher = await _teacherAssignmentRepository.GetAllByFilterAsync(x =>
                    x.Id != id &&
                    x.SchoolClassId == dto.SchoolClassId &&
                    x.SectionId == dto.SectionId &&
                    x.AcademicYearId == dto.AcademicYearId &&
                    x.IsClassTeacher);

                if (classTeacher.Any())
                {
                    throw new Exception("Another Class Teacher is already assigned.");
                }
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            _mapper.Map(dto, assignment);

            assignment.UpdatedBy = currentUserId;
            assignment.UpdatedDate = DateTime.UtcNow;

            await _teacherAssignmentRepository.UpdateAsync(assignment);

            return true;
        }

        public async Task<bool> DeleteTeacherAssignmentAsync(int id)
        {
            var assignment = await _teacherAssignmentRepository.GetAsync(
                x => x.Id == id,
                true);

            if (assignment == null)
            {
                throw new Exception($"Teacher Assignment not found with Id : {id}");
            }

            await _teacherAssignmentRepository.DeleteAsync(assignment);

            return true;
        }


        public async Task<List<DropdownDTO>> GetTeacherDropdownAsync(
    int? departmentId,
    int? schoolClassId,
    int? sectionId,
    int? subjectId,
    int? academicYearId)
        {
            var teachers =
                await _teacherAssignmentRepository
                    .GetTeachersForDropdownAsync(
                        departmentId,
                        schoolClassId,
                        sectionId,
                        subjectId,
                        academicYearId);

            return teachers
                .Select(t => new DropdownDTO
                {
                    Id = t.Id,
                    Code = t.TeacherCode,
                    Text = string.Join(" ",
                        new[]
                        {
                    t.FirstName,
                    t.MiddleName,
                    t.LastName
                        }
                        .Where(x => !string.IsNullOrWhiteSpace(x)))
                })
                .ToList();
        }
    }
}
  