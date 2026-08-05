using AutoMapper;
using Data.Data;
using Model.Models;
using Model.Models.Fee_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class FeeCategoryService : IFeeCategoryService
    {
        private readonly IFeeCategoryRepository _feeCategoryRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public FeeCategoryService(
            IFeeCategoryRepository feeCategoryRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _feeCategoryRepository = feeCategoryRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<FeeCategoryDTO> CreateFeeCategoryAsync(FeeCategoryDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var category = await _feeCategoryRepository.GetAllByFilterAsync(
                x => x.CategoryName.ToLower() == dto.CategoryName.ToLower());

            if (category.Any())
            {
                throw new Exception("Fee Category already exists.");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var feeCategory = _mapper.Map<FeeCategory>(dto);

            feeCategory.CreatedBy = currentUser;
            feeCategory.CreatedDate = DateTime.UtcNow;
            feeCategory.ModifiedBy = currentUser;
            feeCategory.ModifiedDate = DateTime.UtcNow;

            await _feeCategoryRepository.CreateAsync(feeCategory);

            return _mapper.Map<FeeCategoryDTO>(feeCategory);
        }

        public async Task<List<FeeCategoryDTO>> GetAllFeeCategoryAsync()
        {
            var categories = await _feeCategoryRepository.GetAllAsync();

            return _mapper.Map<List<FeeCategoryDTO>>(categories);
        }

        public async Task<FeeCategoryDTO> GetFeeCategoryByIdAsync(int id)
        {
            var category = await _feeCategoryRepository.GetAsync(
                x => x.Id == id,
                true);

            if (category == null)
            {
                throw new Exception($"Fee Category not found with Id : {id}");
            }

            return _mapper.Map<FeeCategoryDTO>(category);
        }

        public async Task<List<FeeCategoryDTO>> GetFeeCategoryByNameAsync(string name)
        {
            var categories = await _feeCategoryRepository.GetAllByFilterAsync(
                x => x.CategoryName.ToLower().Contains(name.ToLower()));

            return _mapper.Map<List<FeeCategoryDTO>>(categories);
        }

        public async Task<bool> UpdateFeeCategoryAsync(int id, FeeCategoryDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var category = await _feeCategoryRepository.GetAsync(
                x => x.Id == id);

            if (category == null)
            {
                throw new Exception($"Fee Category not found with Id : {id}");
            }

            var duplicate = await _feeCategoryRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.CategoryName.ToLower() == dto.CategoryName.ToLower());

            if (duplicate.Any())
            {
                throw new Exception("Fee Category already exists.");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            _mapper.Map(dto, category);

            category.ModifiedBy = currentUser;
            category.ModifiedDate = DateTime.UtcNow;

            await _feeCategoryRepository.UpdateAsync(category);

            return true;
        }

        public async Task<bool> DeleteFeeCategoryAsync(int id)
        {
            var category = await _feeCategoryRepository.GetAsync(
                x => x.Id == id,
                true);

            if (category == null)
            {
                throw new Exception($"Fee Category not found with Id : {id}");
            }

            await _feeCategoryRepository.DeleteAsync(category);

            return true;
        }

        public async Task<List<DropdownDTO>> GetFeeCategoryDropdownAsync()
        {
            var categories = await _feeCategoryRepository.GetAllByFilterAsync(x => x.IsActive);

            return categories
                .OrderBy(x => x.CategoryName)
                .Select(x => new DropdownDTO
                {
                    Id = x.Id,
                    Code = null,
                    Text = x.CategoryName
                })
                .ToList();
        }
    }
}
