using Model.Models.Attendance_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface IAttendanceService
    {
        Task<AttendanceResponseDTO> TakeAttendanceAsync(
             TakeAttendanceDTO dto);
        Task<List<AttendanceStudentDTO>> GetStudentsForAttendanceAsync(
             int teacherAssignmentId);
        Task<AttendanceResponseDTO?> GetAttendanceAsync(
            int teacherAssignmentId,
             DateOnly attendanceDate);
        Task<bool> UpdateAttendanceAsync(
    UpdateAttendanceDTO dto);
    }
}
