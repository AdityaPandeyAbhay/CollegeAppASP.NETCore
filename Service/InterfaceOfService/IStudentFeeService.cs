using Model.Models.Fee_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface IStudentFeeService
    {
        Task<GetStudentFeeDTO> CreateStudentFeeAsync(CreateStudentFeeDTO dto);
        Task<List<GetStudentFeeDTO>> GetAllStudentFeeAsync();
        Task<GetStudentFeeDTO> GetStudentFeeByIdAsync(int id);
        Task<List<GetStudentFeeDTO>> GetStudentFeeByStudentAsync(int studentId);
        Task<bool> UpdateStudentFeeAsync(int id, UpdateStudentFeeDTO dto);
        Task<bool> DeleteStudentFeeAsync(int id);
        Task<List<GetStudentFeeDTO>> GetStudentFeeByStudentNameAsync(string studentName);

    }
}
