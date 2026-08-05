using AutoMapper;
using Data.Data;
using Model.Models;
using Model.Models.Department_model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public DepartmentService(IDepartmentRepository departmentRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _departmentRepository = departmentRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<GetDepartmentDTO> CreateDepartmentAsync(CreateDepartmentDTO dto)
        {
            var dup = await _departmentRepository.GetAllByFilterAsync(x => x.DepartmentCode == dto.DepartmentCode || x.DepartmentName == dto.DepartmentName);
            if (dup.Any()) throw new Exception("Department already exists.");

            var entity = _mapper.Map<Department>(dto);
            entity.CreatedBy = _currentUserService.UserId;
            entity.CreatedDate = DateTime.UtcNow;
            entity.UpdatedBy = _currentUserService.UserId;
            entity.UpdatedDate = DateTime.UtcNow;

            await _departmentRepository.CreateAsync(entity);
            return _mapper.Map<GetDepartmentDTO>(entity);
        }

        public async Task<List<GetDepartmentDTO>> GetAllDepartmentAsync() =>
            _mapper.Map<List<GetDepartmentDTO>>(await _departmentRepository.GetAllAsync());

        public async Task<GetDepartmentDTO> GetByDepartmentCodeAsync(string code)
        {
            var entity = await _departmentRepository.GetAsync(x => x.DepartmentCode == code, true)
                ?? throw new Exception("Department not found.");
            return _mapper.Map<GetDepartmentDTO>(entity);
        }

        public async Task<List<GetDepartmentDTO>> GetDepartmentByNameAsync(string name) =>
            _mapper.Map<List<GetDepartmentDTO>>(await _departmentRepository.GetAllByFilterAsync(x => x.DepartmentName.Contains(name)));

        public async Task<bool> UpdateDepartmentAsync(int id, UpdateDepartmentDTO dto)
        {
            var entity = await _departmentRepository.GetAsync(x => x.Id == id)
                ?? throw new Exception("Department not found.");
            _mapper.Map(dto, entity);
            entity.UpdatedBy = _currentUserService.UserId;
            entity.UpdatedDate = DateTime.UtcNow;
            await _departmentRepository.UpdateAsync(entity);
            return true;
        }

        public async Task<bool> DeleteDepartmentAsync(string code)
        {
            var entity = await _departmentRepository.GetAsync(x => x.DepartmentCode == code, true)
                ?? throw new Exception("Department not found.");
            await _departmentRepository.DeleteAsync(entity);
            return true;
        }


        public async Task<List<DropdownDTO>> GetDepartmentDropdownAsync()
        {
            var departments = await _departmentRepository.GetAllByFilterAsync(x => x.IsActive);

            return departments
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new DropdownDTO
                {
                    Id = x.Id,
                    Text = x.DepartmentName,
                    Code = x.DepartmentCode
                })
                .ToList();
        }
    }
}
