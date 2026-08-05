using System;
using System.Collections.Generic;
using System.Text;

using Data.Data;

namespace Repository.InterfaceOfRepository
{
    public interface IAttendanceRepository : ICollegeRepository<Attendance>
    {
        Task<bool> AttendanceExistsAsync(int teacherAssignmentId, DateOnly attendanceDate);

        Task<List<Student>> GetStudentsByTeacherAssignmentAsync(int teacherAssignmentId);

        Task<Attendance?> GetAttendanceWithDetailsAsync(int attendanceId);

        Task<Attendance?> GetAttendanceByDateAsync(int teacherAssignmentId, DateOnly attendanceDate);

        Task<List<Attendance>> GetTeacherAttendanceAsync(int teacherId);
    }
}
