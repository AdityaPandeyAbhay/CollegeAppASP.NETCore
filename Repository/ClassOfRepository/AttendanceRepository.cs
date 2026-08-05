using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class AttendanceRepository : CollegeRepository<Attendance>, IAttendanceRepository
    {
        private readonly CollegeDBContext _dbContext;
        public AttendanceRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<bool> AttendanceExistsAsync(int teacherAssignmentId, DateOnly attendanceDate)
        {
            return await _dbContext.Attendances
                .AnyAsync(x =>
                    x.TeacherAssignmentId == teacherAssignmentId &&
                    x.AttendanceDate == attendanceDate);
        }

        public async Task<List<Student>> GetStudentsByTeacherAssignmentAsync(int teacherAssignmentId)
        {
            var assignment = await _dbContext.TeacherAssignments
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == teacherAssignmentId);

            if (assignment == null)
                return new List<Student>();

            return await _dbContext.Students
                .Where(x =>
                    x.SchoolClassId == assignment.SchoolClassId &&
                    x.SectionId == assignment.SectionId &&
                    x.IsActive)
                .OrderBy(x => x.AdmissionNumber)
                .ToListAsync();
        }

        public async Task<Attendance?> GetAttendanceWithDetailsAsync(int attendanceId)
        {
            return await _dbContext.Attendances
                .Include(x => x.AttendanceDetails)
                    .ThenInclude(x => x.Student)
                .Include(x => x.TeacherAssignment)
                .FirstOrDefaultAsync(x => x.Id == attendanceId);
        }

        public async Task<Attendance?> GetAttendanceByDateAsync(int teacherAssignmentId, DateOnly attendanceDate)
        {
            return await _dbContext.Attendances
                .Include(x => x.AttendanceDetails)
                .FirstOrDefaultAsync(x =>
                    x.TeacherAssignmentId == teacherAssignmentId &&
                    x.AttendanceDate == attendanceDate);
        }

        public async Task<List<Attendance>> GetTeacherAttendanceAsync(int teacherId)
        {
            return await _dbContext.Attendances
                .Include(x => x.TeacherAssignment)
                .Where(x => x.TeacherAssignment.TeacherId == teacherId)
                .OrderByDescending(x => x.AttendanceDate)
                .ToListAsync();
        }
    }
}
