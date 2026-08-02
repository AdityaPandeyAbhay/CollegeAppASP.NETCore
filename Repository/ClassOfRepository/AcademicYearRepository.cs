using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class AcademicYearRepository
        : CollegeRepository<AcademicYear>, IAcademicYearRepository
    {
        

        public AcademicYearRepository(CollegeDBContext dbContext): base(dbContext)
        {
           
        }
    }
}