using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class FeeStructureRepository
        : CollegeRepository<FeeStructure>, IFeeStructureRepository
    {
       

        public FeeStructureRepository(CollegeDBContext dbContext)
            : base( dbContext)
        {
            
        }
    }
}