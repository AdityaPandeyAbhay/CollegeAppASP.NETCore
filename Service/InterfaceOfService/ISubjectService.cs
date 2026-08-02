using Model.Models.Subject_model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface ISubjectService
    {
        Task<GetSubjectDTO> CreateSubjectAsync(CreateSubjectDTO dto);
        Task<List<GetSubjectDTO>> GetAllSubjectAsync();
        Task<GetSubjectDTO> GetBySubjectCodeAsync(string code);
        Task<List<GetSubjectDTO>> GetSubjectByNameAsync(string name);
        Task<bool> UpdateSubjectAsync(int id, UpdateSubjectDTO dto);
        Task<bool> DeleteSubjectAsync(string code);
    }
}
