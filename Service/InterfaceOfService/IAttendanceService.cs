using Model.Models.Attendance_Model;

namespace Service.InterfaceOfService
{
    public interface IAttendanceService
    {

        #region Attendance


        Task<AttendanceResponseDTO> TakeAttendanceAsync(
            TakeAttendanceDTO dto);



        Task<List<AttendanceListDTO>> GetAllAttendanceAsync();



        Task<AttendanceResponseDTO?> GetAttendanceByIdAsync(
            int attendanceId);



        Task<AttendanceResponseDTO?> GetAttendanceAsync(
            int teacherAssignmentId,
            DateOnly attendanceDate);



        Task<List<AttendanceResponseDTO>> GetTeacherAttendanceAsync(
            int teacherId);



        Task<bool> UpdateAttendanceAsync(
            UpdateAttendanceDTO dto);



        Task<bool> DeleteAttendanceAsync(
            int attendanceId);



        #endregion



        #region Attendance Detail


        Task<List<AttendanceStudentDTO>> GetAttendanceDetailsAsync(
            int attendanceId);



        Task<bool> DeleteAttendanceDetailAsync(
            int detailId);



        #endregion

    }
}