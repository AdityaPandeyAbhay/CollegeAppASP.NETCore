using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class FeeCategoryRepository
        : CollegeRepository<FeeCategory>, IFeeCategoryRepository
    {
        

        public FeeCategoryRepository(CollegeDBContext dbContext)
            : base( dbContext)
        {
            
        }
    }
}
