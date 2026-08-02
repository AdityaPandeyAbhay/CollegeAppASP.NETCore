using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class SchoolClassRepository
        : CollegeRepository<SchoolClass>, ISchoolClassRepository
    {
        

        public SchoolClassRepository(CollegeDBContext dbContext)
            : base( dbContext)
        {
            
        }
    }
}