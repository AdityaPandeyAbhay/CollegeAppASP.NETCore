 using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class NonTeachingStaffRepository : CollegeRepository<NonTeachingStaff> ,INonTeachingStaffRepository
    {
        public NonTeachingStaffRepository(CollegeDBContext dbContext) :base(dbContext)
        {
            
        }
    }
}
