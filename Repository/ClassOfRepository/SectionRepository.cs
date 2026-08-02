using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class SectionRepository
        : CollegeRepository<Section>, ISectionRepository
    {
        

        public SectionRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {

        }
    }
}