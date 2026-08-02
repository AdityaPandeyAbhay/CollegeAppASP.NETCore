using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class StudentFeeRepository
        : CollegeRepository<StudentFee>, IStudentFeeRepository
    {
        
        public StudentFeeRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {
            
        }
    }
}