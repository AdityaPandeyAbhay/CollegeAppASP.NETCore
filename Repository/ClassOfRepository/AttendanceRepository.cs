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
        public AttendanceRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {
        }

      




        #region Attendance



        public async Task<bool> AttendanceExistsAsync(
            int teacherAssignmentId,
            DateOnly attendanceDate)
        {

            return await _dbContext.Attendances

                .AnyAsync(x =>
                    x.TeacherAssignmentId == teacherAssignmentId
                    &&
                    x.AttendanceDate == attendanceDate);

        }





        public async Task<List<Attendance>>
     GetAllAttendanceAsync()
        {
            return await _dbContext.Attendances
                .Include(x => x.TeacherAssignment)
                    .ThenInclude(x => x.Teacher)
                .Include(x => x.TeacherAssignment)
                    .ThenInclude(x => x.SchoolClass)
                .Include(x => x.TeacherAssignment)
                    .ThenInclude(x => x.Section)
                .Include(x => x.TeacherAssignment)
                    .ThenInclude(x => x.Subject)
                .Include(x => x.AttendanceDetails)
                    .ThenInclude(x => x.Student)
                .AsNoTracking()
                .OrderByDescending(x => x.AttendanceDate)
                .ToListAsync();
        }






        public async Task<Attendance?>
        GetAttendanceByIdAsync(
            int attendanceId)
        {

            return await _dbContext.Attendances

                .Include(x => x.TeacherAssignment)

                .Include(x => x.AttendanceDetails)

                    .ThenInclude(x => x.Student)

                .FirstOrDefaultAsync(
                    x => x.Id == attendanceId);

        }






        public async Task<Attendance?>
        GetAttendanceWithDetailsAsync(
            int attendanceId)
        {

            return await _dbContext.Attendances

                .Include(x => x.AttendanceDetails)

                    .ThenInclude(x => x.Student)

                .Include(x => x.TeacherAssignment)

                .FirstOrDefaultAsync(
                    x => x.Id == attendanceId);

        }






        public async Task<Attendance?>
        GetAttendanceByDateAsync(
            int teacherAssignmentId,
            DateOnly attendanceDate)
        {

            return await _dbContext.Attendances

                .Include(x => x.AttendanceDetails)

                .FirstOrDefaultAsync(x =>

                    x.TeacherAssignmentId == teacherAssignmentId

                    &&

                    x.AttendanceDate == attendanceDate

                );

        }







        public async Task<List<Attendance>>
        GetTeacherAttendanceAsync(
            int teacherId)
        {

            return await _dbContext.Attendances

                .Include(x => x.TeacherAssignment)

                .Where(x =>
                    x.TeacherAssignment.TeacherId == teacherId)

                .OrderByDescending(
                    x => x.AttendanceDate)

                .ToListAsync();

        }



        #endregion






        #region Student



        public async Task<List<Student>>
        GetStudentsByTeacherAssignmentAsync(
            int teacherAssignmentId)
        {

            var assignment = await _dbContext.TeacherAssignments

                .AsNoTracking()

                .FirstOrDefaultAsync(
                    x => x.Id == teacherAssignmentId);



            if (assignment == null)
            {
                return new List<Student>();
            }




            return await _dbContext.Students

                .Where(x =>

                    x.SchoolClassId == assignment.SchoolClassId

                    &&

                    x.SectionId == assignment.SectionId

                    &&

                    x.IsActive

                )

                .OrderBy(
                    x => x.AdmissionNumber)

                .ToListAsync();

        }



        #endregion







        #region Attendance Detail




        public async Task<List<AttendanceDetail>>
        GetAttendanceDetailsAsync(
            int attendanceId)
        {

            return await _dbContext.AttendanceDetails

                .Where(x =>
                    x.AttendanceId == attendanceId)

                .Include(x => x.Student)

                .OrderBy(
                    x => x.Student.AdmissionNumber)

                .ToListAsync();

        }






        public async Task<AttendanceDetail?>
        GetAttendanceDetailByIdAsync(
            int detailId)
        {

            return await _dbContext.AttendanceDetails

                .Include(x => x.Student)

                .FirstOrDefaultAsync(
                    x => x.Id == detailId);

        }






        public async Task<bool>
        DeleteAttendanceDetailAsync(
            int detailId)
        {

            var detail =
                await _dbContext.AttendanceDetails

                .FirstOrDefaultAsync(
                    x => x.Id == detailId);



            if (detail == null)
            {
                throw new Exception(
                    "Attendance Detail not found.");
            }




            _dbContext.AttendanceDetails.Remove(detail);



            await _dbContext.SaveChangesAsync();



            return true;

        }



        #endregion


    }
}
