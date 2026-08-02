using Model.Models.Fee_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface IFeeStructureService
    {
        Task<GetFeeStructureDTO> CreateFeeStructureAsync(CreateFeeStructureDTO dto);
        Task<List<GetFeeStructureDTO>> GetAllFeeStructureAsync();
        Task<GetFeeStructureDTO> GetFeeStructureByIdAsync(int id);
        Task<List<GetFeeStructureDTO>> GetFeeStructureByCategoryAsync(int feeCategoryId);
        Task<List<GetFeeStructureDTO>> GetFeeStructureByClassAsync(int classId);
        Task<bool> UpdateFeeStructureAsync(int id, UpdateFeeStructureDTO dto);
        Task<bool> DeleteFeeStructureAsync(int id);

    }
}
