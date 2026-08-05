using Model.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface IAcademicYearService
    {

        Task<AcademicYearDTO> CreateAcademicYearAsync(AcademicYearDTO dto);

        Task<List<AcademicYearDTO>> GetAllAcademicYearAsync();

        Task<AcademicYearDTO> GetByYearNameAsync(string yearName);

        Task<bool> UpdateAcademicYearAsync(int id, AcademicYearDTO dto);

        Task<bool> DeleteAcademicYearAsync(string yearName);
        Task<List<DropdownDTO>> GetDropdownAsync();
    }


}
