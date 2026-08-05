using Model.Models;
using Model.Models.Fee_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface IFeeCategoryService
    {
        Task<FeeCategoryDTO> CreateFeeCategoryAsync(FeeCategoryDTO dto);
        Task<List<FeeCategoryDTO>> GetAllFeeCategoryAsync();
        Task<FeeCategoryDTO> GetFeeCategoryByIdAsync(int id);
        Task<List<FeeCategoryDTO>> GetFeeCategoryByNameAsync(string name);
        Task<bool> UpdateFeeCategoryAsync(int id, FeeCategoryDTO dto);
        Task<bool> DeleteFeeCategoryAsync(int id);
        Task<List<DropdownDTO>> GetFeeCategoryDropdownAsync();
    }
}
