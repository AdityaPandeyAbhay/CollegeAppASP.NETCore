using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Model.Models;
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


        public async Task<List<Teacher>> GetTeachersForDropdownAsync(
    int? departmentId,
    int? schoolClassId,
    int? sectionId,
    int? subjectId,
    int? academicYearId)
        {
            var query = _dbContext.Teachers
                .AsQueryable();

            // Department is the main filter for teachers
            if (departmentId.HasValue)
            {
                query = query.Where(x =>
                    x.DepartmentId == departmentId.Value);
            }

            // Only active teachers
            query = query.Where(x => x.IsActive);

            // If class, section, subject and academic year
            // are supplied, exclude teachers who are already
            // assigned to the same combination.
            if (schoolClassId.HasValue &&
                sectionId.HasValue &&
                subjectId.HasValue &&
                academicYearId.HasValue)
            {
                var alreadyAssignedTeacherIds =
                    _dbContext.TeacherAssignments
                        .Where(x =>
                            x.SchoolClassId == schoolClassId.Value &&
                            x.SectionId == sectionId.Value &&
                            x.SubjectId == subjectId.Value &&
                            x.AcademicYearId == academicYearId.Value)
                        .Select(x => x.TeacherId);

                query = query.Where(x =>
                    !alreadyAssignedTeacherIds.Contains(x.Id));
            }

            return await query
                .OrderBy(x => x.FirstName)
                .ThenBy(x => x.LastName)
                .ToListAsync();
        }


    }
}