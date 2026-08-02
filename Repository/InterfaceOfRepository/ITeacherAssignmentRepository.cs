using System;
using System.Collections.Generic;
using System.Text;


using Data.Data;

namespace Repository.InterfaceOfRepository
{
    public interface ITeacherAssignmentRepository
        : ICollegeRepository<TeacherAssignment>
    {
    }
}