using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.ClassOfRepository
{
    public class FeeStructureRepository
        : CollegeRepository<FeeStructure>, IFeeStructureRepository
    {
        public FeeStructureRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {
        }

        public async Task<List<FeeStructure>> GetAllWithDetailsAsync()
        {
            return await _dbContext.feeStructures
                .Include(f => f.AcademicYear)
                .Include(f => f.Department)
                .Include(f => f.SchoolClass)
                .Include(f => f.FeeCategory)
                .ToListAsync();
        }

        public async Task<FeeStructure?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbContext.feeStructures
                .Include(f => f.AcademicYear)
                .Include(f => f.Department)
                .Include(f => f.SchoolClass)
                .Include(f => f.FeeCategory)
                .FirstOrDefaultAsync(f => f.Id == id);
        }

        public async Task<List<FeeStructure>> GetByCategoryWithDetailsAsync(int feeCategoryId)
        {
            return await _dbContext.feeStructures
                .Include(f => f.AcademicYear)
                .Include(f => f.Department)
                .Include(f => f.SchoolClass)
                .Include(f => f.FeeCategory)
                .Where(f => f.FeeCategoryId == feeCategoryId)
                .ToListAsync();
        }

        public async Task<List<FeeStructure>> GetByClassWithDetailsAsync(int classId)
        {
            return await _dbContext.feeStructures
                .Include(f => f.AcademicYear)
                .Include(f => f.Department)
                .Include(f => f.SchoolClass)
                .Include(f => f.FeeCategory)
                .Where(f => f.ClassId == classId)
                .ToListAsync();
        }
    }
}