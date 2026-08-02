using Model.Models.NonTeachingStaff;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface INonTeachingStaffService
    {
        Task<GetNonTeachingStaffDTO> CreateNonTeachingStaffAsync(CreateNonTeachingStaffDTO dto);
        Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffAsync();
        Task<GetNonTeachingStaffDTO> GetNonTeachingStaffByCodeAsync(string code);
        Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffByNameAsync(string name);

        Task<bool> UpdateNonTeachingStaffAsync(int id, UpdateNonTeachingStaffDTO dto);

        Task<bool> DeleteNonTeachingStaffAsync(string code);

    }
}
