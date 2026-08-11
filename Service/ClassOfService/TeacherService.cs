using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Data.Data;
using Model.Models;
using Model.Models.Teacher_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class TeacherService : ITeacherService
    {
        private readonly ITeacherRepository _teacherRepository;
        private IMapper _mapper;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserServices _currentUserService;

        public TeacherService(ITeacherRepository teacherRepository, IMapper mapper, IUserRepository userRepository, ICurrentUserServices currentUserService)
        {
            _teacherRepository = teacherRepository;
            _mapper = mapper;
            _userRepository = userRepository;
            _currentUserService = currentUserService;

        }



       
       public async Task<GetTeacherDTO> CreateTeacherAsync(CreateTeacherDTO dto)
           {
            ArgumentNullException.ThrowIfNull(dto);

            // Check whether User exists
            var users = await _userRepository.GetAllByFilterAsync(
                u => u.Id == dto.UserId);

            if (users == null || !users.Any())
            {
                throw new Exception("User not found.");
            }

            // Check whether Teacher already exists for this User
            var existingTeachers = await _teacherRepository.GetAllByFilterAsync(
                t => t.UserId == dto.UserId);

            if (existingTeachers != null && existingTeachers.Any())
            {
                throw new Exception("Teacher already exists for this User.");
            }

            // Get logged-in user
            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // Map DTO to Entity
            var teacher = _mapper.Map<Teacher>(dto);

            // Audit fields
            teacher.CreatedBy = currentUserId;
            teacher.CreatedDate = DateTime.UtcNow;
            teacher.UpdatedBy = currentUserId;
            teacher.UpdatedDate = DateTime.UtcNow;

            // Save Teacher
            await _teacherRepository.CreateAsync(teacher);

            // Return created Teacher
            return _mapper.Map<GetTeacherDTO>(teacher);
        }





        public async Task<List<GetTeacherDTO>> GetAllTeacherAsync()
        {
            var teacher = await _teacherRepository.GetAllAsync();
            return _mapper.Map<List<GetTeacherDTO>>(teacher);
        }


        public async Task<GetTeacherDTO?> GetByTeacherCodeAsync(string code)
        {
            var teachers = await _teacherRepository.GetAllByFilterAsync(
                x => x.TeacherCode.ToLower().Contains(code.ToLower())
            );

            var teacher = teachers.FirstOrDefault();

            if (teacher == null)
            {
                return null;
            }

            return _mapper.Map<GetTeacherDTO>(teacher);
        }


        public async Task<List<GetTeacherDTO>> GetTeacherByNameAsync(string name)
        {
            var teachers = await _teacherRepository.GetAllByFilterAsync(x =>
                x.FirstName.ToLower().Contains(name.ToLower()) ||

                (x.MiddleName != null &&
                 x.MiddleName.ToLower().Contains(name.ToLower())) ||

                x.LastName.ToLower().Contains(name.ToLower()) ||

                (x.FirstName + " " + x.LastName)
                    .ToLower()
                    .Contains(name.ToLower()) ||

                (x.FirstName + " " +
                 (x.MiddleName ?? "") + " " +
                 x.LastName)
                    .ToLower()
                    .Contains(name.ToLower())
            );

            return _mapper.Map<List<GetTeacherDTO>>(teachers);
        }


        public async Task<bool> UpdateTeacherAsync(int id, UpdateTeacherDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var teacher = await _teacherRepository.GetAsync(t => t.Id == id);

            if (teacher == null)
            {
                throw new Exception($"Teacher not found with TeacherId : {id}");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // Copy DTO values into the existing entity
            _mapper.Map(dto, teacher);

            teacher.UpdatedBy = currentUserId;
            teacher.UpdatedDate = DateTime.UtcNow;



            await _teacherRepository.UpdateAsync(teacher);

            return true;
        }


        public async Task<bool> DeleteTeacherAsync(string code)
        {
            var teacher = await _teacherRepository.GetAsync(t => t.TeacherCode == code, true);
            if (teacher == null)
            {
                throw new Exception($" Teacher {code} not  Exist");
            }

            await _teacherRepository.DeleteAsync(teacher);


            return true;

        }

        public async Task<List<DropdownDTO>> GetTeacherDropdownAsync(
    int? schoolClassId,
    int? subjectId)
        {

            var teachers = await _teacherRepository.GetAllByFilterAsync(
                t =>
                t.IsActive &&

                (
                    schoolClassId == null ||

                    t.TeacherAssignments.Any(
                        ta => ta.SchoolClassId == schoolClassId
                    )
                )

                &&

                (
                    subjectId == null ||

                    t.TeacherAssignments.Any(
                        ta => ta.SubjectId == subjectId
                    )
                )

            );


            return teachers.Select(t => new DropdownDTO
            {
                Id = t.Id,

                Code = t.TeacherCode,

                Text =
                    t.FirstName
                    +
                    (
                        string.IsNullOrEmpty(t.MiddleName)
                        ? ""
                        : " " + t.MiddleName
                    )
                    +
                    " "
                    +
                    t.LastName

            }).ToList();

        }
    }
}
