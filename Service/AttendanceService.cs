using System;
using System.Collections.Generic;
using System.Text;

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



        public async Task<AttendanceResponseDTO> TakeAttendanceAsync(
    TakeAttendanceDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
                throw new UnauthorizedAccessException("User not authenticated.");

            //-------------------------------------------------------
            // Logged In Teacher
            //-------------------------------------------------------

            var teacher = await _teacherRepository.GetAsync(
                t => t.UserId == currentUserId);

            if (teacher == null)
                throw new Exception("Teacher not found.");

            //-------------------------------------------------------
            // Teacher Assignment
            //-------------------------------------------------------

            var assignment =
                await _teacherAssignmentRepository.GetAsync(
                    x => x.Id == dto.TeacherAssignmentId);

            if (assignment == null)
                throw new Exception("Teacher Assignment not found.");

            //-------------------------------------------------------
            // Security Check
            //-------------------------------------------------------

            if (assignment.TeacherId != teacher.Id)
                throw new Exception("You are not authorized to take attendance.");

            //-------------------------------------------------------
            // Duplicate Attendance
            //-------------------------------------------------------

            bool alreadyTaken =
                await _attendanceRepository.AttendanceExistsAsync(
                    dto.TeacherAssignmentId,
                    dto.AttendanceDate);

            if (alreadyTaken)
                throw new Exception("Attendance already taken.");

            //-------------------------------------------------------
            // Load Students
            //-------------------------------------------------------

            var students =
                await _attendanceRepository
                .GetStudentsByTeacherAssignmentAsync(
                    dto.TeacherAssignmentId);

            if (students.Count == 0)
                throw new Exception("No students found.");

            //-------------------------------------------------------
            // Validate Student List
            //-------------------------------------------------------

            foreach (var item in dto.Students)
            {
                bool exists =
                    students.Any(x => x.Id == item.StudentId);

                if (!exists)
                    throw new Exception(
                        $"Student Id {item.StudentId} does not belong to this class.");
            }

            //-------------------------------------------------------
            // Attendance Header
            //-------------------------------------------------------

            var attendance = new Attendance
            {
                TeacherAssignmentId = dto.TeacherAssignmentId,

                AttendanceDate = dto.AttendanceDate,

                Remarks = dto.Remarks,

                Status = "Submitted",

                CreatedBy = currentUserId,

                CreatedDate = DateTime.UtcNow,

                ModifiedBy = currentUserId,

                ModifiedDate = DateTime.UtcNow
            };

            //-------------------------------------------------------
            // Attendance Details
            //-------------------------------------------------------

            foreach (var student in dto.Students)
            {
                attendance.AttendanceDetails.Add(
                    new AttendanceDetail
                    {
                        StudentId = student.StudentId,

                        AttendanceStatus = student.AttendanceStatus,

                        Remarks = student.Remarks,

                        CreatedBy = currentUserId,

                        CreatedDate = DateTime.UtcNow,

                        ModifiedBy = currentUserId,

                        ModifiedDate = DateTime.UtcNow
                    });
            }

            //-------------------------------------------------------
            // Save
            //-------------------------------------------------------

            await _attendanceRepository.CreateAsync(attendance);

            //-------------------------------------------------------
            // Return DTO
            //-------------------------------------------------------

            return new AttendanceResponseDTO
            {
                AttendanceId = attendance.Id,

                TeacherAssignmentId = attendance.TeacherAssignmentId,

                AttendanceDate = attendance.AttendanceDate,

                Remarks = attendance.Remarks,

                Status = attendance.Status,

                Students = attendance.AttendanceDetails
                    .Select(x => new AttendanceStudentDTO
                    {
                        StudentId = x.StudentId,

                        AttendanceStatus = x.AttendanceStatus,

                        Remarks = x.Remarks
                    }).ToList()
            };
        }



        public async Task<List<AttendanceStudentDTO>> GetStudentsForAttendanceAsync(
    int teacherAssignmentId)
        {
            //-------------------------------------------------------
            // Logged In User
            //-------------------------------------------------------

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
                throw new UnauthorizedAccessException("User not authenticated.");

            //-------------------------------------------------------
            // Logged In Teacher
            //-------------------------------------------------------

            var teacher = await _teacherRepository.GetAsync(
                x => x.UserId == currentUserId);

            if (teacher == null)
                throw new Exception("Teacher not found.");

            //-------------------------------------------------------
            // Teacher Assignment
            //-------------------------------------------------------

            var assignment =
                await _teacherAssignmentRepository.GetAsync(
                    x => x.Id == teacherAssignmentId);

            if (assignment == null)
                throw new Exception("Teacher Assignment not found.");

            //-------------------------------------------------------
            // Security Check
            //-------------------------------------------------------

            if (assignment.TeacherId != teacher.Id)
                throw new Exception(
                    "You are not authorized to access this class.");

            //-------------------------------------------------------
            // Load Students
            //-------------------------------------------------------

            var students =
                await _attendanceRepository
                .GetStudentsByTeacherAssignmentAsync(
                    teacherAssignmentId);

            if (students.Count == 0)
                throw new Exception(
                    "No students found.");

            //-------------------------------------------------------
            // Convert DTO
            //-------------------------------------------------------

            int srNo = 1;

            return students.Select(student => new AttendanceStudentDTO
            {
                SrNo = srNo++,

                StudentId = student.Id,

                AdmissionNumber = student.AdmissionNumber,

                StudentName =
                    student.FirstName
                    +
                    (string.IsNullOrWhiteSpace(student.MiddleName)
                        ? ""
                        : " " + student.MiddleName)
                    +
                    " "
                    +
                    student.LastName,

                AttendanceStatus = "Present",

                Remarks = ""
            }).ToList();
        }



        public async Task<AttendanceResponseDTO?> GetAttendanceAsync(
    int teacherAssignmentId,
    DateOnly attendanceDate)
        {
            //-------------------------------------------------------
            // Logged In User
            //-------------------------------------------------------

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
                throw new UnauthorizedAccessException("User not authenticated.");

            //-------------------------------------------------------
            // Logged In Teacher
            //-------------------------------------------------------

            var teacher = await _teacherRepository.GetAsync(
                x => x.UserId == currentUserId);

            if (teacher == null)
                throw new Exception("Teacher not found.");

            //-------------------------------------------------------
            // Teacher Assignment
            //-------------------------------------------------------

            var assignment = await _teacherAssignmentRepository.GetAsync(
                x => x.Id == teacherAssignmentId);

            if (assignment == null)
                throw new Exception("Teacher Assignment not found.");

            if (assignment.TeacherId != teacher.Id)
                throw new Exception("You are not authorized.");

            //-------------------------------------------------------
            // Attendance
            //-------------------------------------------------------

            var attendance =
                await _attendanceRepository.GetAttendanceByDateAsync(
                    teacherAssignmentId,
                    attendanceDate);

            if (attendance == null)
                return null;

            attendance =
                await _attendanceRepository.GetAttendanceWithDetailsAsync(
                    attendance.Id);

            if (attendance == null)
                return null;

            //-------------------------------------------------------
            // DTO
            //-------------------------------------------------------

            return new AttendanceResponseDTO
            {
                AttendanceId = attendance.Id,

                TeacherAssignmentId = attendance.TeacherAssignmentId,

                AttendanceDate = attendance.AttendanceDate,

                Remarks = attendance.Remarks,

                Status = attendance.Status,

                Students = attendance.AttendanceDetails
                    .OrderBy(x => x.Student.AdmissionNumber)
                    .Select(x => new AttendanceStudentDTO
                    {
                        StudentId = x.StudentId,

                        AdmissionNumber = x.Student.AdmissionNumber,

                        StudentName =
                            x.Student.FirstName
                            + " "
                            + (x.Student.MiddleName ?? "")
                            + " "
                            + x.Student.LastName,

                        AttendanceStatus = x.AttendanceStatus,

                        Remarks = x.Remarks
                    }).ToList()
            };
        }


        public async Task<bool> UpdateAttendanceAsync(
    UpdateAttendanceDTO dto)
        {
            //-------------------------------------------------------
            // Logged In User
            //-------------------------------------------------------

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
                throw new UnauthorizedAccessException();

            //-------------------------------------------------------
            // Teacher
            //-------------------------------------------------------

            var teacher = await _teacherRepository.GetAsync(
                x => x.UserId == currentUserId);

            if (teacher == null)
                throw new Exception("Teacher not found.");

            //-------------------------------------------------------
            // Attendance
            //-------------------------------------------------------

            var attendance =
                await _attendanceRepository
                .GetAttendanceWithDetailsAsync(dto.AttendanceId);

            if (attendance == null)
                throw new Exception("Attendance not found.");

            //-------------------------------------------------------
            // Security
            //-------------------------------------------------------

            if (attendance.TeacherAssignment.TeacherId != teacher.Id)
                throw new Exception("Unauthorized.");

            //-------------------------------------------------------
            // Update Header
            //-------------------------------------------------------

            attendance.Remarks = dto.Remarks;

            attendance.Status = dto.Status;

            attendance.ModifiedBy = currentUserId;

            attendance.ModifiedDate = DateTime.UtcNow;

            //-------------------------------------------------------
            // Update Detail
            //-------------------------------------------------------

            foreach (var detail in attendance.AttendanceDetails)
            {
                var dtoStudent =
                    dto.Students.FirstOrDefault(
                        x => x.StudentId == detail.StudentId);

                if (dtoStudent == null)
                    continue;

                detail.AttendanceStatus =
                    dtoStudent.AttendanceStatus;

                detail.Remarks =
                    dtoStudent.Remarks;

                detail.ModifiedBy =
                    currentUserId;

                detail.ModifiedDate =
                    DateTime.UtcNow;
            }

            //-------------------------------------------------------
            // Save
            //-------------------------------------------------------

            await _attendanceRepository.UpdateAsync(attendance);

            return true;
        }
    }

}