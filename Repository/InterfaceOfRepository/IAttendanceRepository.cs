using Data.Data;

namespace Repository.InterfaceOfRepository
{
    public interface IAttendanceRepository
        : ICollegeRepository<Attendance>
    {


        #region Attendance


        Task<bool> AttendanceExistsAsync(
            int teacherAssignmentId,
            DateOnly attendanceDate);



        Task<List<Attendance>>GetAllAttendanceAsync();



        Task<Attendance?> GetAttendanceByIdAsync(
            int attendanceId);



        Task<Attendance?> GetAttendanceWithDetailsAsync(
            int attendanceId);



        Task<Attendance?> GetAttendanceByDateAsync(
            int teacherAssignmentId,
            DateOnly attendanceDate);



        Task<List<Attendance>> GetTeacherAttendanceAsync(
            int teacherId);



        #endregion





        #region Student


        Task<List<Student>> GetStudentsByTeacherAssignmentAsync(
            int teacherAssignmentId);



        #endregion






        #region Attendance Detail


        Task<List<AttendanceDetail>> GetAttendanceDetailsAsync(
            int attendanceId);



        Task<AttendanceDetail?> GetAttendanceDetailByIdAsync(
            int detailId);



        Task<bool> DeleteAttendanceDetailAsync(
            int detailId);



        #endregion


    }
}