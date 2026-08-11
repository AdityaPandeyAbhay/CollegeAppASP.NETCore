using Data.Data;
using Model.Models;
using System;
using System.Collections.Generic;
using System.Text;

using Model.Models.TeacherAssignment_Model;

namespace Repository.InterfaceOfRepository
{
    public interface ITeacherAssignmentRepository
        : ICollegeRepository<TeacherAssignment>
    {


        Task<List<Teacher>> GetTeachersForDropdownAsync(
     int? departmentId,
     int? schoolClassId,
     int? sectionId,
     int? subjectId,
     int? academicYearId);
    }


}
