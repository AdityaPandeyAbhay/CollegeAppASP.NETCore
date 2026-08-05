using AutoMapper;
using Data.Data;
using Model.Models;
using Model.Models.Class_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class ClassService : IClassService
    {
        private readonly ISchoolClassRepository _classRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly ICurrentUserServices _currentUserService;
        private readonly IMapper _mapper;

        public ClassService(
            ISchoolClassRepository classRepository,
            IDepartmentRepository departmentRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _classRepository = classRepository;
            _departmentRepository = departmentRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<SchoolClassDTO> CreateClassAsync(SchoolClassDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            // Check Department
            var department = await _departmentRepository.GetAsync(x => x.Id == dto.DepartmentId);

            if (department == null)
            {
                throw new Exception("Department not found.");
            }

            // Duplicate Class Code
            var classCodeExists = await _classRepository.GetAllByFilterAsync(
                x => x.ClassCode == dto.ClassCode);

            if (classCodeExists.Any())
            {
                throw new Exception("Class Code already exists.");
            }

            // Duplicate Class Name in Department
            var classNameExists = await _classRepository.GetAllByFilterAsync(
                x => x.DepartmentId == dto.DepartmentId &&
                     x.ClassName.ToLower() == dto.ClassName.ToLower());

            if (classNameExists.Any())
            {
                throw new Exception("Class Name already exists in this Department.");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var classEntity = _mapper.Map<SchoolClass>(dto);

            classEntity.CreatedBy = currentUserId;
            classEntity.CreatedDate = DateTime.UtcNow;
            classEntity.UpdatedBy = currentUserId;
            classEntity.UpdatedDate = DateTime.UtcNow;

            await _classRepository.CreateAsync(classEntity);

            return _mapper.Map<SchoolClassDTO>(classEntity);
        }

        public async Task<List<SchoolClassDTO>> GetAllClassAsync()
        {
            var classes = await _classRepository.GetAllAsync();

            return _mapper.Map<List<SchoolClassDTO>>(classes);
        }

        public async Task<SchoolClassDTO> GetByClassCodeAsync(string classCode)
        {
            var classEntity = await _classRepository.GetAsync(
                x => x.ClassCode == classCode,
                true);

            if (classEntity == null)
            {
                throw new Exception($"Class '{classCode}' not found.");
            }

            return _mapper.Map<SchoolClassDTO>(classEntity);
        }

        public async Task<List<SchoolClassDTO>> GetClassByNameAsync(string className)
        {
            var classes = await _classRepository.GetAllByFilterAsync(x =>
                x.ClassName.ToLower().Contains(className.ToLower()));

            return _mapper.Map<List<SchoolClassDTO>>(classes);
        }
        public async Task<List<DropdownDTO>> GetClassDropdownAsync()
        {
            var classes = await _classRepository.GetAllByFilterAsync(x => x.IsActive);

            return classes
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new DropdownDTO
                {
                    Id = x.Id,
                    Text = x.ClassName,
                    Code = x.ClassCode
                })
                .ToList();
        }

        public async Task<bool> UpdateClassAsync(int id, SchoolClassDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var classEntity = await _classRepository.GetAsync(x => x.Id == id);

            if (classEntity == null)
            {
                throw new Exception($"Class not found with Id : {id}");
            }

            // Department Validation
            var department = await _departmentRepository.GetAsync(x => x.Id == dto.DepartmentId);

            if (department == null)
            {
                throw new Exception("Department not found.");
            }

            // Duplicate Class Code
            var classCodeExists = await _classRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.ClassCode == dto.ClassCode);

            if (classCodeExists.Any())
            {
                throw new Exception("Class Code already exists.");
            }

            // Duplicate Class Name
            var classNameExists = await _classRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.DepartmentId == dto.DepartmentId &&
                     x.ClassName.ToLower() == dto.ClassName.ToLower());

            if (classNameExists.Any())
            {
                throw new Exception("Class Name already exists.");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            _mapper.Map(dto, classEntity);

            classEntity.UpdatedBy = currentUserId;
            classEntity.UpdatedDate = DateTime.UtcNow;

            await _classRepository.UpdateAsync(classEntity);

            return true;
        }

        public async Task<bool> DeleteClassAsync(string classCode)
        {
            var classEntity = await _classRepository.GetAsync(
                x => x.ClassCode == classCode,
                true);

            if (classEntity == null)
            {
                throw new Exception($"Class '{classCode}' not found.");
            }

            await _classRepository.DeleteAsync(classEntity);

            return true;
        }
    }
}
