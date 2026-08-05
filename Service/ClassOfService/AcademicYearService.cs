using AutoMapper;
using Data.Data;
using Model.Models;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class AcademicYearService : IAcademicYearService
    {
        private readonly IAcademicYearRepository _academicYearRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public AcademicYearService(
            IAcademicYearRepository academicYearRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _academicYearRepository  = academicYearRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<AcademicYearDTO> CreateAcademicYearAsync(AcademicYearDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            if (dto.StartDate >= dto.EndDate)
                throw new Exception("Start Date must be less than End Date.");

            var duplicate = await _academicYearRepository.GetAllByFilterAsync(
                x => x.YearName.ToLower() == dto.YearName.ToLower());

            if (duplicate.Any())
                throw new Exception("Academic Year already exists.");

            var currentUser = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUser))
                throw new UnauthorizedAccessException("User is not authenticated.");

            if (dto.IsCurrent)
            {
                var currentYears = await _academicYearRepository.GetAllByFilterAsync(x => x.IsCurrent);
                foreach (var item in currentYears)
                {
                    item.IsCurrent = false;
                    item.UpdatedBy = currentUser;
                    item.UpdatedDate = DateTime.UtcNow;
                    await _academicYearRepository.UpdateAsync(item);
                }
            }

            var entity = _mapper.Map<AcademicYear>(dto);
            entity.CreatedBy = currentUser;
            entity.CreatedDate = DateTime.UtcNow;
            entity.UpdatedBy = currentUser;
            entity.UpdatedDate = DateTime.UtcNow;

            await _academicYearRepository.CreateAsync(entity);

            return _mapper.Map<AcademicYearDTO>(entity);
        }

        public async Task<List<AcademicYearDTO>> GetAllAcademicYearAsync()
        {
            var list = await _academicYearRepository.GetAllAsync();
            return _mapper.Map<List<AcademicYearDTO>>(list);
        }

        public async Task<AcademicYearDTO> GetByYearNameAsync(string yearName)
        {
            var entity = await _academicYearRepository.GetAsync(
                x => x.YearName == yearName, true);

            if (entity == null)
                throw new Exception("Academic Year not found.");

            return _mapper.Map<AcademicYearDTO>(entity);
        }

        public async Task<bool> UpdateAcademicYearAsync(int id, AcademicYearDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            if (dto.StartDate >= dto.EndDate)
                throw new Exception("Start Date must be less than End Date.");

            var entity = await _academicYearRepository.GetAsync(x => x.Id == id);
            if (entity == null)
                throw new Exception($"Academic Year not found with Id : {id}");

            var duplicate = await _academicYearRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.YearName.ToLower() == dto.YearName.ToLower());

            if (duplicate.Any())
                throw new Exception("Academic Year already exists.");

            var currentUser = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUser))
                throw new UnauthorizedAccessException("User is not authenticated.");

            if (dto.IsCurrent)
            {
                var currentYears = await _academicYearRepository.GetAllByFilterAsync(
                    x => x.IsCurrent && x.Id != id);

                foreach (var item in currentYears)
                {
                    item.IsCurrent = false;
                    item.UpdatedBy = currentUser;
                    item.UpdatedDate = DateTime.UtcNow;
                    await _academicYearRepository.UpdateAsync(item);
                }
            }

            _mapper.Map(dto, entity);
            entity.UpdatedBy = currentUser;
            entity.UpdatedDate = DateTime.UtcNow;

            await _academicYearRepository.UpdateAsync(entity);

            return true;
        }

        public async Task<bool> DeleteAcademicYearAsync(string yearName)
        {
            var entity = await _academicYearRepository.GetAsync(
                x => x.YearName == yearName, true);

            if (entity == null)
                throw new Exception("Academic Year not found.");

            await _academicYearRepository.DeleteAsync(entity);
            return true;
        }

        public async Task<List<DropdownDTO>> GetDropdownAsync()
        {
            var academicYears = await _academicYearRepository.GetAllByFilterAsync(
                x => x.IsActive,
                true);

            return academicYears
                .OrderByDescending(x => x.StartDate)
                .Select(x => new DropdownDTO
                {
                    Id = x.Id,
                    Text = x.YearName
                })
                .ToList();
        }

    }
}
