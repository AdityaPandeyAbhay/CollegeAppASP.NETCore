using Model.Models;
using Model.Models.Department_model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface IDepartmentService
    {
        Task<GetDepartmentDTO> CreateDepartmentAsync(CreateDepartmentDTO dto);

        Task<List<GetDepartmentDTO>> GetAllDepartmentAsync();

        Task<GetDepartmentDTO> GetByDepartmentCodeAsync(string code);

        Task<List<GetDepartmentDTO>> GetDepartmentByNameAsync(string name);

        Task<bool> UpdateDepartmentAsync(int id, UpdateDepartmentDTO dto);

        Task<bool> DeleteDepartmentAsync(string code);
        Task<List<DropdownDTO>> GetDepartmentDropdownAsync();
    }
}
