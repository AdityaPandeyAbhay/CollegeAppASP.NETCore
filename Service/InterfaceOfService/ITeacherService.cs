using Model.Models.Teacher_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface ITeacherService
    {
        Task<GetTeacherDTO> CreateTeacherAsync(CreateTeacherDTO dto);
        Task<bool> DeleteTeacherAsync(string code);
        Task<List<GetTeacherDTO>> GetAllTeacherAsync();
        Task<GetTeacherDTO> GetByTeacherCodeAsync(string code);
        Task<List<GetTeacherDTO>> GetTeacherByNameAsync(string name);
        Task<bool> UpdateTeacherAsync(int id, UpdateTeacherDTO dto);
    }
}
