using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class TeacherAssignmentRepository
        : CollegeRepository<TeacherAssignment>, ITeacherAssignmentRepository
    {
        

        public TeacherAssignmentRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {


        }
    }
}