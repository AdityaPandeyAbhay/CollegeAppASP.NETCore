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
            var user = await _userRepository.GetAllByFilterAsync(u => u.Id == dto.UserId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            var IsExiting = await _teacherRepository.GetAllByFilterAsync(u => u.UserId == dto.UserId);
            if (IsExiting != null)
            {
                throw new Exception("Teacher already exists for this User.");
            }



            // Get logged-in user
            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var teacher = _mapper.Map<Teacher>(dto);
            teacher.CreatedBy = currentUserId;
            teacher.CreatedDate = DateTime.UtcNow;

            teacher.UpdatedBy = currentUserId;
            teacher.UpdatedDate = DateTime.UtcNow;
            //teacher.CreatedBy = ;
            await _teacherRepository.CreateAsync(teacher);


            return _mapper.Map<GetTeacherDTO>(teacher);
        }



        public async Task<List<GetTeacherDTO>> GetAllTeacherAsync()
        {
            var teacher = await _teacherRepository.GetAllAsync();
            return _mapper.Map<List<GetTeacherDTO>>(teacher);
        }


        public async Task<GetTeacherDTO> GetByTeacherCodeAsync(string code)
        {

            var teacher = await _teacherRepository.GetAllByFilterAsync(t => t.TeacherCode == code, true);

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
