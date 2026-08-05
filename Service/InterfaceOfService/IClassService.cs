using Model.Models;
using Model.Models.Class_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface IClassService
    {
        Task<SchoolClassDTO> CreateClassAsync(SchoolClassDTO dto);
        Task<List<SchoolClassDTO>> GetAllClassAsync();
        Task<SchoolClassDTO> GetByClassCodeAsync(string classCode);
        Task<List<SchoolClassDTO>> GetClassByNameAsync(string className);
        Task<bool> UpdateClassAsync(int id, SchoolClassDTO dto);

        Task<bool> DeleteClassAsync(string classCode);
        Task<List<DropdownDTO>> GetClassDropdownAsync();
    }
}
