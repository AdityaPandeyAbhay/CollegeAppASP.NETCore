using Model.Models.Class_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface ISectionService
    {
        Task<GetSectionDTO> CreateSectionAsync(CreateSectionDTO dto);
        Task<List<GetSectionDTO>> GetAllSectionAsync();
        Task<GetSectionDTO> GetBySectionCodeAsync(string code);
        Task<List<GetSectionDTO>> GetSectionByNameAsync(string name);
        Task<bool> UpdateSectionAsync(int id, UpdateSectionDTO dto);
        Task<bool> DeleteSectionAsync(string code);
    }
}
