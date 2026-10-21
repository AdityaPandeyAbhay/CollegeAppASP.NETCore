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

            var assignment =
                await _teacherAssignmentRepository.GetAsync(
                    x => x.Id == dto.TeacherAssignmentId);

            bool isSuperAdminOrAdmin = _currentUserService.IsInRole("Super Admin") || _currentUserService.IsInRole("Admin") || _currentUserService.IsInRole("Operator");

            if (assignment == null)
            {
                if (isSuperAdminOrAdmin)
                {
                    assignment = await _teacherAssignmentRepository.GetAsync(x => x.IsActive);
                    if (assignment != null)
                    {
                        dto.TeacherAssignmentId = assignment.Id;
                    }
                }

                if (assignment == null)
                    throw new Exception("Teacher Assignment not found.");
            }

            if (!isSuperAdminOrAdmin)
            {
                var teacher =
                    await _teacherRepository.GetAsync(
                        x => x.UserId == userId);

                if (teacher == null)
                    throw new Exception("Teacher profile not found.");

                if (assignment.TeacherId != teacher.Id)
                    throw new Exception(
                        "You are not authorized to mark attendance for this class.");
            }

            var existingAttendance =
                await _attendanceRepository
                .GetAttendanceByDateAsync(
                    dto.TeacherAssignmentId,
                    dto.AttendanceDate);

            if (existingAttendance != null)
            {
                existingAttendance.Remarks = dto.Remarks;
                existingAttendance.ModifiedBy = userId;
                existingAttendance.ModifiedDate = DateTime.UtcNow;

                foreach (var student in dto.Students)
                {
                    var detail = existingAttendance.AttendanceDetails
                        .FirstOrDefault(x => x.StudentId == student.StudentId);

                    if (detail != null)
                    {
                        detail.AttendanceStatus = student.AttendanceStatus;
                        detail.Remarks = student.Remarks;
                        detail.ModifiedBy = userId;
                        detail.ModifiedDate = DateTime.UtcNow;
                    }
                    else
                    {
                        existingAttendance.AttendanceDetails.Add(new AttendanceDetail
                        {
                            AttendanceId = existingAttendance.Id,
                            StudentId = student.StudentId,
                            AttendanceStatus = student.AttendanceStatus,
                            Remarks = student.Remarks,
                            CreatedBy = userId,
                            CreatedDate = DateTime.UtcNow
                        });
                    }
                }

                await _attendanceRepository.UpdateAsync(existingAttendance);
                return _mapper.Map<AttendanceResponseDTO>(existingAttendance);
            }

            var attendance = new Attendance
            {
                TeacherAssignmentId = dto.TeacherAssignmentId,
                AttendanceDate = dto.AttendanceDate,
                Remarks = dto.Remarks,
                Status = "Submitted",
                CreatedBy = userId,
                CreatedDate = DateTime.UtcNow
            };

            foreach (var student in dto.Students)
            {
                attendance.AttendanceDetails.Add(
                    new AttendanceDetail
                    {
                        StudentId = student.StudentId,
                        AttendanceStatus = student.AttendanceStatus,
                        Remarks = student.Remarks,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow
                    });
            }

            var result = await _attendanceRepository.CreateAsync(attendance);
            return _mapper.Map<AttendanceResponseDTO>(result);
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

                TeacherAssignmentId = x.TeacherAssignmentId,

                SchoolClassId = x.TeacherAssignment?.SchoolClassId ?? 0,

                SectionId = x.TeacherAssignment?.SectionId ?? 0,

                AcademicYearId = x.TeacherAssignment?.AcademicYearId ?? 0,

                AttendanceDate =
                    x.AttendanceDate,

                TeacherName =
                    x.TeacherAssignment?.Teacher != null
                        ? (x.TeacherAssignment.Teacher.FirstName
                            + " "
                            + (x.TeacherAssignment.Teacher.MiddleName ?? "")
                            + " "
                            + x.TeacherAssignment.Teacher.LastName).Trim()
                        : "Unknown",

                ClassName =
                    x.TeacherAssignment?.SchoolClass?.ClassName ?? "",

                SectionName =
                    x.TeacherAssignment?.Section?.SectionName ?? "",

                SubjectName =
                    x.TeacherAssignment?.Subject?.SubjectName ?? "",

                Remarks = x.Remarks,

                PresentCount =
                    x.AttendanceDetails?
                        .Count(a => a.AttendanceStatus == "Present" || a.AttendanceStatus == "Exam-P") ?? 0,

                AbsentCount =
                    x.AttendanceDetails?
                        .Count(a => a.AttendanceStatus == "Absent" || a.AttendanceStatus == "Exam-A") ?? 0,

                LeaveCount =
                    x.AttendanceDetails?
                        .Count(a => a.AttendanceStatus == "Leave") ?? 0,

                LateCount =
                    x.AttendanceDetails?
                        .Count(a => a.AttendanceStatus == "Late") ?? 0,

                Students = x.AttendanceDetails?.Select(d => new AttendanceStudentDTO
                {
                    StudentId = d.StudentId,
                    StudentName = d.Student != null
                        ? (d.Student.FirstName + " " + (d.Student.MiddleName ?? "") + " " + d.Student.LastName).Trim()
                        : "",
                    AdmissionNumber = d.Student?.AdmissionNumber ?? "",
                    AttendanceStatus = d.AttendanceStatus ?? "Present",
                    Remarks = d.Remarks
                }).ToList() ?? new List<AttendanceStudentDTO>()

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




            attendance.Remarks = dto.Remarks;
            attendance.Status = !string.IsNullOrEmpty(dto.Status) ? dto.Status : attendance.Status;
            attendance.ModifiedBy = _currentUserService.UserId;
            attendance.ModifiedDate = DateTime.UtcNow;

            var userId = _currentUserService.UserId;

            foreach (var student in dto.Students)
            {
                var detail = attendance.AttendanceDetails
                    .FirstOrDefault(x => x.StudentId == student.StudentId);

                if (detail != null)
                {
                    detail.AttendanceStatus = student.AttendanceStatus;
                    detail.Remarks = student.Remarks;
                    detail.ModifiedBy = userId;
                    detail.ModifiedDate = DateTime.UtcNow;
                }
                else
                {
                    attendance.AttendanceDetails.Add(new AttendanceDetail
                    {
                        AttendanceId = attendance.Id,
                        StudentId = student.StudentId,
                        AttendanceStatus = student.AttendanceStatus,
                        Remarks = student.Remarks,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow
                    });
                }
            }

            await _attendanceRepository.UpdateAsync(attendance);
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