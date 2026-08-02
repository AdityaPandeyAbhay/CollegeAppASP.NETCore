using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class TeacherRepository : CollegeRepository<Teacher>, ITeacherRepository
    {
        public TeacherRepository(CollegeDBContext dbContext) : base( dbContext)
        {
            
        }
    }
}
