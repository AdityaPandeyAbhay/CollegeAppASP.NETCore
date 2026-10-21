using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Data.Data;

namespace Repository.InterfaceOfRepository
{
    public interface IFeeStructureRepository
        : ICollegeRepository<FeeStructure>
    {
        Task<List<FeeStructure>> GetAllWithDetailsAsync();
        Task<FeeStructure?> GetByIdWithDetailsAsync(int id);
        Task<List<FeeStructure>> GetByCategoryWithDetailsAsync(int feeCategoryId);
        Task<List<FeeStructure>> GetByClassWithDetailsAsync(int classId);
    }
}