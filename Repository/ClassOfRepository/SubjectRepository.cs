using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class SubjectRepository
        : CollegeRepository<Subject>, ISubjectRepository
    {
        

        public SubjectRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {

        }
    }
}
