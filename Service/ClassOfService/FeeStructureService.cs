using AutoMapper;
using Data.Data;
using Model.Models.Fee_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class FeeStructureService : IFeeStructureService
    {
        private readonly IFeeStructureRepository _feeStructureRepository;
        private readonly IAcademicYearRepository _academicYearRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly ISchoolClassRepository _classRepository;
        private readonly IFeeCategoryRepository _feeCategoryRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public FeeStructureService(
            IFeeStructureRepository feeStructureRepository,
            IAcademicYearRepository academicYearRepository,
            IDepartmentRepository departmentRepository,
            ISchoolClassRepository classRepository,
            IFeeCategoryRepository feeCategoryRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _feeStructureRepository = feeStructureRepository;
            _academicYearRepository = academicYearRepository;
            _departmentRepository = departmentRepository;
            _classRepository = classRepository;
            _feeCategoryRepository = feeCategoryRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<GetFeeStructureDTO> CreateFeeStructureAsync(CreateFeeStructureDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var academicYear = await _academicYearRepository.GetAsync(x => x.Id == dto.AcademicYearId);
            if (academicYear == null)
                throw new Exception("Academic Year not found.");

            var department = await _departmentRepository.GetAsync(x => x.Id == dto.DepartmentId);
            if (department == null)
                throw new Exception("Department not found.");

            var schoolClass = await _classRepository.GetAsync(x => x.Id == dto.ClassId);
            if (schoolClass == null)
                throw new Exception("Class not found.");

            var feeCategory = await _feeCategoryRepository.GetAsync(x => x.Id == dto.FeeCategoryId);
            if (feeCategory == null)
                throw new Exception("Fee Category not found.");

            var duplicate = await _feeStructureRepository.GetAllByFilterAsync(x =>
                x.AcademicYearId == dto.AcademicYearId &&
                x.DepartmentId == dto.DepartmentId &&
                x.ClassId == dto.ClassId &&
                x.FeeCategoryId == dto.FeeCategoryId);

            if (duplicate.Any())
            {
                throw new Exception("Fee Structure already exists.");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var feeStructure = _mapper.Map<FeeStructure>(dto);

            feeStructure.CreatedBy = currentUser;
            feeStructure.CreatedDate = DateTime.UtcNow;
            feeStructure.ModifiedBy = currentUser;
            feeStructure.ModifiedDate = DateTime.UtcNow;
            feeStructure.IsActive = true;

            await _feeStructureRepository.CreateAsync(feeStructure);

            return _mapper.Map<GetFeeStructureDTO>(feeStructure);
        }

        public async Task<List<GetFeeStructureDTO>> GetAllFeeStructureAsync()
        {
            var feeStructures = await _feeStructureRepository.GetAllAsync();

            return _mapper.Map<List<GetFeeStructureDTO>>(feeStructures);
        }

        public async Task<GetFeeStructureDTO> GetFeeStructureByIdAsync(int id)
        {
            var feeStructure = await _feeStructureRepository.GetAsync(
                x => x.Id == id,
                true);

            if (feeStructure == null)
            {
                throw new Exception($"Fee Structure not found with Id : {id}");
            }

            return _mapper.Map<GetFeeStructureDTO>(feeStructure);
        }

        public async Task<List<GetFeeStructureDTO>> GetFeeStructureByCategoryAsync(int feeCategoryId)
        {
            var feeStructures = await _feeStructureRepository.GetAllByFilterAsync(
                x => x.FeeCategoryId == feeCategoryId);

            return _mapper.Map<List<GetFeeStructureDTO>>(feeStructures);
        }

        public async Task<List<GetFeeStructureDTO>> GetFeeStructureByClassAsync(int classId)
        {
            var feeStructures = await _feeStructureRepository.GetAllByFilterAsync(
                x => x.ClassId == classId);

            return _mapper.Map<List<GetFeeStructureDTO>>(feeStructures);
        }

        public async Task<bool> UpdateFeeStructureAsync(int id, UpdateFeeStructureDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var feeStructure = await _feeStructureRepository.GetAsync(
                x => x.Id == id);

            if (feeStructure == null)
            {
                throw new Exception($"Fee Structure not found with Id : {id}");
            }

            var academicYear = await _academicYearRepository.GetAsync(
                x => x.Id == dto.AcademicYearId);

            if (academicYear == null)
            {
                throw new Exception("Academic Year not found.");
            }

            var department = await _departmentRepository.GetAsync(
                x => x.Id == dto.DepartmentId);

            if (department == null)
            {
                throw new Exception("Department not found.");
            }

            var schoolClass = await _classRepository.GetAsync(
                x => x.Id == dto.ClassId);

            if (schoolClass == null)
            {
                throw new Exception("Class not found.");
            }

            var feeCategory = await _feeCategoryRepository.GetAsync(
                x => x.Id == dto.FeeCategoryId);

            if (feeCategory == null)
            {
                throw new Exception("Fee Category not found.");
            }

            var duplicate = await _feeStructureRepository.GetAllByFilterAsync(x =>
                x.Id != id &&
                x.AcademicYearId == dto.AcademicYearId &&
                x.DepartmentId == dto.DepartmentId &&
                x.ClassId == dto.ClassId &&
                x.FeeCategoryId == dto.FeeCategoryId);

            if (duplicate.Any())
            {
                throw new Exception("Fee Structure already exists.");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            _mapper.Map(dto, feeStructure);

            feeStructure.ModifiedBy = currentUser;
            feeStructure.ModifiedDate = DateTime.UtcNow;

            await _feeStructureRepository.UpdateAsync(feeStructure);

            return true;
        }

        public async Task<bool> DeleteFeeStructureAsync(int id)
        {
            var feeStructure = await _feeStructureRepository.GetAsync(
                x => x.Id == id,
                true);

            if (feeStructure == null)
            {
                throw new Exception($"Fee Structure not found with Id : {id}");
            }

            await _feeStructureRepository.DeleteAsync(feeStructure);

            return true;
        }

        public async Task<List<FeeStructureDropdownDTO>> GetFeeStructureDropdownAsync()
        {
            var feeStructures = await _feeStructureRepository.GetAllByFilterAsync(x => x.IsActive);

            return feeStructures.Select(x => new FeeStructureDropdownDTO
            {
                Id = x.Id,
                Name = $"{x.FeeCategory.CategoryName} - {x.Amount}"
            }).ToList();
        }
    }
}
