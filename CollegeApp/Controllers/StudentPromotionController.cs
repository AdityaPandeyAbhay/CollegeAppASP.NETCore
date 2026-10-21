using CollegeApp.Data;
using CollegeApp.Models;
using Data.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CollegeApp.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Super Admin,Admin,Operator")]
public class StudentPromotionController : ControllerBase
{
    private readonly CollegeDBContext _db;
    public StudentPromotionController(CollegeDBContext db) => _db = db;

    // =====================================================
    // GET STUDENT ACADEMIC HISTORY TIMELINE
    // GET: /api/StudentPromotion/History/{studentId}
    // =====================================================
    [HttpGet("History/{studentId:int}")]
    public async Task<ActionResult<APIResponse>> History(int studentId)
    {
        var history = await _db.StudentAcademicYears.AsNoTracking()
            .Where(x => x.StudentId == studentId)
            .OrderByDescending(x => x.AcademicYear.StartDate)
            .Select(x => new
            {
                id = x.Id,
                academicYearId = x.AcademicYearId,
                academicYearName = x.AcademicYear != null ? x.AcademicYear.YearName : "",
                departmentId = x.DepartmentId,
                departmentName = x.Department != null ? x.Department.DepartmentName : "",
                classId = x.SchoolClassId,
                className = x.SchoolClass != null ? x.SchoolClass.ClassName : "",
                sectionId = x.SectionId,
                sectionName = x.Section != null ? x.Section.SectionName : "",
                rollNumber = x.RollNumber,
                status = x.Status,
                isPromoted = x.Status == "Promoted",
                enrollmentDate = x.EnrollmentDate,
                promotionDate = x.PromotionDate,
                remarks = x.Remarks,
                isCurrentYear = x.AcademicYear != null && x.AcademicYear.IsCurrent && x.Status == "Active"
            }).ToListAsync();
        return Ok(SuccessResponse(history));
    }

    // =====================================================
    // GET STUDENTS BY ACADEMIC YEAR, CLASS & SECTION
    // GET: /api/StudentPromotion/StudentsByYear
    // =====================================================
    [HttpGet("StudentsByYear")]
    public async Task<ActionResult<APIResponse>> StudentsByYear(
        [FromQuery] int academicYearId,
        [FromQuery] int? departmentId,
        [FromQuery] int schoolClassId,
        [FromQuery] int sectionId)
    {
        if (academicYearId <= 0 || schoolClassId <= 0 || sectionId <= 0)
            return BadRequest(Failure("Academic year, class and section are required."));

        await EnsureInitialSyncAsync();

        var selectedYear = await _db.AcademicYears.FindAsync(academicYearId);
        var selectedYearStart = selectedYear?.StartDate ?? DateTime.MinValue;

        var query = _db.StudentAcademicYears.AsNoTracking()
            .Include(x => x.Student)
            .Include(x => x.AcademicYear)
            .Include(x => x.Department)
            .Include(x => x.SchoolClass)
            .Include(x => x.Section)
            .Where(x => x.AcademicYearId == academicYearId && x.SchoolClassId == schoolClassId && x.SectionId == sectionId);

        if (departmentId.HasValue && departmentId.Value > 0)
        {
            query = query.Where(x => x.DepartmentId == departmentId.Value);
        }

        var enrolledList = await query
            .OrderBy(x => x.RollNumber)
            .ThenBy(x => x.Student.FirstName)
            .Select(x => new PromotionRosterStudentDto
            {
                StudentId = x.StudentId,
                EnrollmentId = x.Id,
                AdmissionNumber = x.Student.AdmissionNumber,
                StudentName = (x.Student.FirstName + " " + (x.Student.MiddleName ?? "") + " " + x.Student.LastName).Trim(),
                FirstName = x.Student.FirstName,
                MiddleName = x.Student.MiddleName,
                LastName = x.Student.LastName,
                RollNumber = x.RollNumber,
                Status = x.Status,
                IsPromoted = x.Status == "Promoted",
                Photo = x.Student.Photo,
                FatherName = x.Student.FatherName,
                MotherName = x.Student.MotherName,
                DOB = x.Student.DOB,
                Gender = x.Student.Gender,
                Email = x.Student.Email,
                PhoneNumber = x.Student.PhoneNumber,
                Address = x.Student.Address,
                AcademicYearId = x.AcademicYearId,
                AcademicYearName = x.AcademicYear != null ? x.AcademicYear.YearName : "",
                DepartmentId = x.DepartmentId,
                DepartmentName = x.Department != null ? x.Department.DepartmentName : "",
                SchoolClassId = x.SchoolClassId,
                ClassName = x.SchoolClass != null ? x.SchoolClass.ClassName : "",
                SectionId = x.SectionId,
                SectionName = x.Section != null ? x.Section.SectionName : ""
            }).ToListAsync();

        // If no records in StudentAcademicYears, fallback to matching Students master table
        if (enrolledList.Count == 0)
        {
            var fallbackQuery = _db.Students.AsNoTracking()
                .Include(s => s.Department)
                .Include(s => s.SchoolClass)
                .Include(s => s.Section)
                .Where(s => s.IsActive && s.SchoolClassId == schoolClassId && s.SectionId == sectionId);

            if (departmentId.HasValue && departmentId.Value > 0)
            {
                fallbackQuery = fallbackQuery.Where(s => s.DepartmentId == departmentId.Value);
            }

            enrolledList = await fallbackQuery
                .OrderBy(s => s.FirstName)
                .Select(s => new PromotionRosterStudentDto
                {
                    StudentId = s.Id,
                    EnrollmentId = null,
                    AdmissionNumber = s.AdmissionNumber,
                    StudentName = (s.FirstName + " " + (s.MiddleName ?? "") + " " + s.LastName).Trim(),
                    FirstName = s.FirstName,
                    MiddleName = s.MiddleName,
                    LastName = s.LastName,
                    RollNumber = null,
                    Status = "Active",
                    IsPromoted = false,
                    Photo = s.Photo,
                    FatherName = s.FatherName,
                    MotherName = s.MotherName,
                    DOB = s.DOB,
                    Gender = s.Gender,
                    Email = s.Email,
                    PhoneNumber = s.PhoneNumber,
                    Address = s.Address,
                    AcademicYearId = academicYearId,
                    AcademicYearName = selectedYear != null ? selectedYear.YearName : "",
                    DepartmentId = s.DepartmentId,
                    DepartmentName = s.Department != null ? s.Department.DepartmentName : "",
                    SchoolClassId = s.SchoolClassId,
                    ClassName = s.SchoolClass != null ? s.SchoolClass.ClassName : "",
                    SectionId = s.SectionId,
                    SectionName = s.Section != null ? s.Section.SectionName : ""
                }).ToListAsync();
        }

        // Check multi-year promotion targets for every student
        if (enrolledList.Count > 0)
        {
            var studentIds = enrolledList.Select(x => x.StudentId).ToList();
            var allPromotedHistory = await _db.StudentAcademicYears.AsNoTracking()
                .Include(h => h.AcademicYear)
                .Include(h => h.SchoolClass)
                .Include(h => h.Section)
                .Where(h => studentIds.Contains(h.StudentId) && h.AcademicYear != null && h.AcademicYear.StartDate > selectedYearStart)
                .ToListAsync();

            foreach (var st in enrolledList)
            {
                var nextPromoted = allPromotedHistory
                    .Where(h => h.StudentId == st.StudentId)
                    .OrderBy(h => h.AcademicYear.StartDate)
                    .FirstOrDefault();

                if (nextPromoted != null)
                {
                    st.IsPromoted = true;
                    st.Status = "Promoted";
                    st.PromotedToClassName = nextPromoted.SchoolClass?.ClassName ?? "";
                    st.PromotedToSectionName = nextPromoted.Section?.SectionName ?? "";
                    st.PromotedToYearName = nextPromoted.AcademicYear?.YearName ?? "";
                }
                else
                {
                    st.IsPromoted = st.Status == "Promoted";
                    st.PromotedToClassName = null;
                    st.PromotedToSectionName = null;
                    st.PromotedToYearName = null;
                }
            }
        }

        return Ok(SuccessResponse(enrolledList));
    }

    // =====================================================
    // BULK PROMOTE STUDENTS TO NEXT CLASS / ACADEMIC YEAR
    // POST: /api/StudentPromotion/Promote
    // =====================================================
    [HttpPost("Promote")]
    public async Task<ActionResult<APIResponse>> Promote([FromBody] PromoteStudentsRequest request)
    {
        if (request == null || request.Students == null || request.Students.Count == 0 ||
            request.SourceAcademicYearId <= 0 || request.TargetAcademicYearId <= 0 ||
            request.SourceSchoolClassId <= 0 || request.SourceSectionId <= 0 ||
            request.TargetDepartmentId <= 0 || request.TargetSchoolClassId <= 0 || request.TargetSectionId <= 0)
        {
            return BadRequest(Failure("Complete source, target, and student selections are required."));
        }

        if (request.SourceAcademicYearId == request.TargetAcademicYearId)
        {
            return BadRequest(Failure("Students can only be promoted to a future academic year, not the same academic year."));
        }

        var sourceYear = await _db.AcademicYears.FindAsync(request.SourceAcademicYearId);
        var targetYear = await _db.AcademicYears.FindAsync(request.TargetAcademicYearId);

        if (sourceYear != null && targetYear != null && targetYear.StartDate <= sourceYear.StartDate)
        {
            return BadRequest(Failure($"Target Academic Year ({targetYear.YearName}) must start after Source Academic Year ({sourceYear.YearName}). Reverse order promotion is not allowed."));
        }

        var studentIds = request.Students.Select(x => x.StudentId).Distinct().ToList();
        var userId = User.FindFirst("UserId")?.Value ?? "SYSTEM";
        var itemsMap = request.Students.GroupBy(x => x.StudentId).ToDictionary(g => g.Key, g => g.First());

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            int promotedCount = 0;

            foreach (var studentId in studentIds)
            {
                var student = await _db.Students.FindAsync(studentId);
                if (student == null) continue;

                var item = itemsMap[studentId];

                // 1. Mark Source Year Record as Promoted (or create if was missing)
                var sourceRecord = await _db.StudentAcademicYears
                    .FirstOrDefaultAsync(x => x.StudentId == studentId && x.AcademicYearId == request.SourceAcademicYearId);

                if (sourceRecord != null)
                {
                    sourceRecord.Status = "Promoted";
                    sourceRecord.PromotionDate = DateTime.UtcNow;
                    sourceRecord.Remarks = request.Remarks;
                }
                else
                {
                    _db.StudentAcademicYears.Add(new StudentAcademicYear
                    {
                        StudentId = studentId,
                        AcademicYearId = request.SourceAcademicYearId,
                        DepartmentId = student.DepartmentId > 0 ? student.DepartmentId : request.TargetDepartmentId,
                        SchoolClassId = request.SourceSchoolClassId,
                        SectionId = request.SourceSectionId,
                        RollNumber = null,
                        Status = "Promoted",
                        PromotionDate = DateTime.UtcNow,
                        EnrollmentDate = student.AdmissionDate,
                        Remarks = request.Remarks,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                // 2. Add or Update Target Year Record
                var targetRecord = await _db.StudentAcademicYears
                    .FirstOrDefaultAsync(x => x.StudentId == studentId && x.AcademicYearId == request.TargetAcademicYearId);

                if (targetRecord != null)
                {
                    targetRecord.DepartmentId = request.TargetDepartmentId;
                    targetRecord.SchoolClassId = request.TargetSchoolClassId;
                    targetRecord.SectionId = request.TargetSectionId;
                    targetRecord.RollNumber = item.NewRollNumber ?? targetRecord.RollNumber;
                    targetRecord.Status = string.IsNullOrWhiteSpace(item.Status) ? "Active" : item.Status;
                    targetRecord.PromotionDate = null;
                    targetRecord.Remarks = request.Remarks;
                }
                else
                {
                    _db.StudentAcademicYears.Add(new StudentAcademicYear
                    {
                        StudentId = studentId,
                        AcademicYearId = request.TargetAcademicYearId,
                        DepartmentId = request.TargetDepartmentId,
                        SchoolClassId = request.TargetSchoolClassId,
                        SectionId = request.TargetSectionId,
                        RollNumber = item.NewRollNumber,
                        Status = string.IsNullOrWhiteSpace(item.Status) ? "Active" : item.Status,
                        EnrollmentDate = DateTime.UtcNow,
                        Remarks = request.Remarks,
                        CreatedBy = userId,
                        CreatedDate = DateTime.UtcNow
                    });
                }

                // 3. Update master Student Table
                student.DepartmentId = request.TargetDepartmentId;
                student.SchoolClassId = request.TargetSchoolClassId;
                student.SectionId = request.TargetSectionId;
                student.UpdatedBy = userId;
                student.UpdatedDate = DateTime.UtcNow;

                promotedCount++;
            }

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(SuccessResponse(new
            {
                promotedCount = promotedCount,
                message = $"Successfully promoted {promotedCount} student(s) and preserved previous year history."
            }));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(StatusCodes.Status500InternalServerError, Failure(ex.Message));
        }
    }

    // =====================================================
    // SYNC EXISTING STUDENTS TO CURRENT / ADMISSION YEAR
    // POST: /api/StudentPromotion/SyncExisting
    // =====================================================
    [HttpPost("SyncExisting")]
    public async Task<ActionResult<APIResponse>> SyncExisting()
    {
        var count = await EnsureInitialSyncAsync();
        return Ok(SuccessResponse(new { syncedCount = count }));
    }

    private async Task<int> EnsureInitialSyncAsync()
    {
        var allYears = await _db.AcademicYears.OrderBy(y => y.StartDate).ToListAsync();
        if (allYears.Count == 0) return 0;

        var currentYear = allYears.FirstOrDefault(y => y.IsCurrent) ?? allYears.Last();
        var allStudents = await _db.Students.Include(s => s.StudentAcademicYears).ToListAsync();

        int count = 0;
        foreach (var s in allStudents)
        {
            var matchedYear = allYears.FirstOrDefault(y => s.AdmissionDate.Date >= y.StartDate.Date && s.AdmissionDate.Date <= y.EndDate.Date)
                              ?? allYears.FirstOrDefault(y => y.YearName.Contains(s.AdmissionDate.Year.ToString()))
                              ?? currentYear;

            if (s.StudentAcademicYears == null || s.StudentAcademicYears.Count == 0)
            {
                s.StudentAcademicYears = new List<StudentAcademicYear>
                {
                    new StudentAcademicYear
                    {
                        StudentId = s.Id,
                        AcademicYearId = matchedYear.Id,
                        DepartmentId = s.DepartmentId,
                        SchoolClassId = s.SchoolClassId,
                        SectionId = s.SectionId,
                        RollNumber = null,
                        Status = s.IsActive ? "Active" : "Inactive",
                        EnrollmentDate = s.AdmissionDate != default ? s.AdmissionDate : DateTime.UtcNow,
                        CreatedBy = "SYSTEM_SYNC",
                        CreatedDate = DateTime.UtcNow
                    }
                };
                count++;
            }
            else
            {
                if (s.StudentAcademicYears.Count > 1)
                {
                    var earliestYear = allYears.OrderBy(y => y.StartDate).First();
                    var earliestRecord = s.StudentAcademicYears
                        .OrderBy(x => x.AcademicYear != null ? x.AcademicYear.StartDate : DateTime.MaxValue)
                        .First();

                    if ((earliestRecord.CreatedBy == "SYSTEM_SYNC" || earliestRecord.CreatedBy == "SYSTEM") &&
                        earliestRecord.AcademicYearId == currentYear.Id && earliestYear.Id != currentYear.Id)
                    {
                        earliestRecord.AcademicYearId = earliestYear.Id;
                        earliestRecord.CreatedBy = "SYSTEM_CORRECT";
                        count++;
                    }
                }
                else if (s.StudentAcademicYears.Count == 1)
                {
                    var singleRecord = s.StudentAcademicYears.First();
                    if ((singleRecord.CreatedBy == "SYSTEM_SYNC" || singleRecord.CreatedBy == "SYSTEM") &&
                        singleRecord.Status != "Promoted" && singleRecord.AcademicYearId != matchedYear.Id)
                    {
                        singleRecord.AcademicYearId = matchedYear.Id;
                        singleRecord.DepartmentId = s.DepartmentId;
                        singleRecord.SchoolClassId = s.SchoolClassId;
                        singleRecord.SectionId = s.SectionId;
                        singleRecord.CreatedBy = "SYSTEM_CORRECT";
                        count++;
                    }
                }
            }
        }

        if (count > 0)
        {
            await _db.SaveChangesAsync();
        }
        return count;
    }

    private static APIResponse SuccessResponse(object data) => new() { Status = true, StatusCode = HttpStatusCode.OK, Data = data };
    private static APIResponse Failure(string error) => new() { Status = false, StatusCode = HttpStatusCode.BadRequest, Errors = new List<string> { error } };
}

public class PromoteStudentsRequest
{
    public int SourceAcademicYearId { get; set; }
    public int SourceSchoolClassId { get; set; }
    public int SourceSectionId { get; set; }
    public int TargetAcademicYearId { get; set; }
    public int TargetDepartmentId { get; set; }
    public int TargetSchoolClassId { get; set; }
    public int TargetSectionId { get; set; }
    public string? Remarks { get; set; }
    public List<PromotedStudentItem> Students { get; set; } = new();
}

public class PromotedStudentItem
{
    public int StudentId { get; set; }
    public string? NewRollNumber { get; set; }
    public string? Status { get; set; }
}

public class PromotionRosterStudentDto
{
    public int StudentId { get; set; }
    public int? EnrollmentId { get; set; }
    public string AdmissionNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? RollNumber { get; set; }
    public string Status { get; set; } = "Active";
    public bool IsPromoted { get; set; }
    public string? PromotedToClassName { get; set; }
    public string? PromotedToSectionName { get; set; }
    public string? PromotedToYearName { get; set; }
    public string? Photo { get; set; }
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public DateTime DOB { get; set; }
    public string? Gender { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public int AcademicYearId { get; set; }
    public string AcademicYearName { get; set; } = string.Empty;
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int SchoolClassId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public int SectionId { get; set; }
    public string SectionName { get; set; } = string.Empty;
}
