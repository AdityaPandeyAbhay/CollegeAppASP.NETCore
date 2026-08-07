using AutoMapper;
using Data.Data;
using Model.Models.Attendance_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;

namespace Service.ClassOfService
{

    public class AttendanceService : IAttendanceService
    {

        private readonly IAttendanceRepository _attendanceRepository;
        private readonly ITeacherAssignmentRepository _teacherAssignmentRepository;
        private readonly ITeacherRepository _teacherRepository;
        private readonly ICurrentUserServices _currentUserService;
        private readonly IMapper _mapper;



        public AttendanceService(
            IAttendanceRepository attendanceRepository,
            ITeacherAssignmentRepository teacherAssignmentRepository,
            ITeacherRepository teacherRepository,
            ICurrentUserServices currentUserService,
            IMapper mapper)
        {
            _attendanceRepository = attendanceRepository;
            _teacherAssignmentRepository = teacherAssignmentRepository;
            _teacherRepository = teacherRepository;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }



        #region Create Attendance


        public async Task<AttendanceResponseDTO> TakeAttendanceAsync(
            TakeAttendanceDTO dto)
        {

            ArgumentNullException.ThrowIfNull(dto);


            var userId = _currentUserService.UserId;


            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException();



            var teacher =
                await _teacherRepository.GetAsync(
                    x => x.UserId == userId);



            if (teacher == null)
                throw new Exception("Teacher not found.");




            var assignment =
                await _teacherAssignmentRepository.GetAsync(
                    x => x.Id == dto.TeacherAssignmentId);



            if (assignment == null)
                throw new Exception("Teacher Assignment not found.");




            if (assignment.TeacherId != teacher.Id)
                throw new Exception(
                    "You are not authorized.");




            var exists =
                await _attendanceRepository
                .AttendanceExistsAsync(
                    dto.TeacherAssignmentId,
                    dto.AttendanceDate);



            if (exists)
                throw new Exception(
                    "Attendance already exists.");




            var attendance = new Attendance
            {

                TeacherAssignmentId =
                    dto.TeacherAssignmentId,


                AttendanceDate =
                    dto.AttendanceDate,


                Remarks =
                    dto.Remarks,


                Status =
                    "Submitted",


                CreatedBy =
                    userId,


                CreatedDate =
                    DateTime.UtcNow

            };




            foreach (var student in dto.Students)
            {

                attendance.AttendanceDetails.Add(
                    new AttendanceDetail
                    {

                        StudentId =
                            student.StudentId,


                        AttendanceStatus =
                            student.AttendanceStatus,


                        Remarks =
                            student.Remarks,


                        CreatedBy =
                            userId,


                        CreatedDate =
                            DateTime.UtcNow

                    });

            }




            await _attendanceRepository
                .CreateAsync(attendance);



            return _mapper.Map<AttendanceResponseDTO>(
                attendance);

        }


        #endregion





        #region Get Attendance



        public async Task<List<AttendanceListDTO>>
            GetAllAttendanceAsync()
        {

            var data =
                await _attendanceRepository
                .GetAllAttendanceAsync();



            return data.Select(x => new AttendanceListDTO
            {

                AttendanceId = x.Id,

                AttendanceDate = x.AttendanceDate,


                PresentCount =
                    x.AttendanceDetails
                    .Count(a => a.AttendanceStatus == "Present"),


                AbsentCount =
                    x.AttendanceDetails
                    .Count(a => a.AttendanceStatus == "Absent"),


                LeaveCount =
                    x.AttendanceDetails
                    .Count(a => a.AttendanceStatus == "Leave"),


                LateCount =
                    x.AttendanceDetails
                    .Count(a => a.AttendanceStatus == "Late")


            }).ToList();

        }






        public async Task<AttendanceResponseDTO?>
            GetAttendanceByIdAsync(int attendanceId)
        {

            var attendance =
                await _attendanceRepository
                .GetAttendanceWithDetailsAsync(
                    attendanceId);



            if (attendance == null)
                return null;



            return _mapper.Map<AttendanceResponseDTO>(
                attendance);

        }






        public async Task<AttendanceResponseDTO?>
            GetAttendanceAsync(
            int teacherAssignmentId,
            DateOnly attendanceDate)
        {

            var attendance =
                await _attendanceRepository
                .GetAttendanceByDateAsync(
                    teacherAssignmentId,
                    attendanceDate);



            if (attendance == null)
                return null;



            return _mapper.Map<AttendanceResponseDTO>(
                attendance);

        }






        public async Task<List<AttendanceResponseDTO>>
            GetTeacherAttendanceAsync(
            int teacherId)
        {


            var data =
                await _attendanceRepository
                .GetTeacherAttendanceAsync(
                    teacherId);



            return _mapper.Map<
                List<AttendanceResponseDTO>>(data);

        }



        #endregion





        #region Update



        public async Task<bool>
            UpdateAttendanceAsync(
            UpdateAttendanceDTO dto)
        {


            var attendance =
                await _attendanceRepository
                .GetAttendanceWithDetailsAsync(
                    dto.AttendanceId);



            if (attendance == null)
                throw new Exception(
                    "Attendance not found.");




            attendance.Remarks =
                dto.Remarks;


            attendance.Status =
                dto.Status;



            foreach (var detail in attendance.AttendanceDetails)
            {


                var student =
                    dto.Students
                    .FirstOrDefault(
                        x => x.StudentId ==
                        detail.StudentId);



                if (student != null)
                {

                    detail.AttendanceStatus =
                        student.AttendanceStatus;


                    detail.Remarks =
                        student.Remarks;

                }

            }



            await _attendanceRepository
                .UpdateAsync(attendance);



            return true;

        }


        #endregion





        #region Delete Attendance


        public async Task<bool>
            DeleteAttendanceAsync(
            int attendanceId)
        {


            var attendance =
                await _attendanceRepository
                .GetAsync(
                    x => x.Id == attendanceId);



            if (attendance == null)
                throw new Exception(
                    "Attendance not found.");



            await _attendanceRepository
                .DeleteAsync(attendance);



            return true;

        }


        #endregion





        #region Attendance Detail



        public async Task<List<AttendanceStudentDTO>>
            GetAttendanceDetailsAsync(
            int attendanceId)
        {


            var details =
                await _attendanceRepository
                .GetAttendanceDetailsAsync(
                    attendanceId);



            return details.Select(x => new AttendanceStudentDTO
            {

                StudentId = x.StudentId,


                AdmissionNumber =
                    x.Student.AdmissionNumber,


                StudentName =
                    x.Student.FirstName +
                    " " +
                    x.Student.LastName,


                AttendanceStatus =
                    x.AttendanceStatus,


                Remarks =
                    x.Remarks


            }).ToList();


        }





        public async Task<bool>
            DeleteAttendanceDetailAsync(
            int detailId)
        {


            return await _attendanceRepository
                .DeleteAttendanceDetailAsync(
                    detailId);

        }


        #endregion


    }

}