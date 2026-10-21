using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Data.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.EntityFrameworkCore;
using Model.Models.Student_Model;
using Repository.InterfaceOfRepository;
using System.Net;


namespace CollegeApp.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]

    public class StudentController : ControllerBase
    {

        private readonly ILogger<StudentController> _logger;

        private readonly ICollegeRepository<Student> _studentRepository;
        private readonly ICollegeRepository<User> _userRepository;

        private readonly IMapper _mapper;
        private APIResponse _apiResponse;
        private readonly ICollegeRepository<Department> _departmentRepository;
        private readonly ICollegeRepository<SchoolClass> _classRepository;
        private readonly ICollegeRepository<Section> _sectionRepository;
        private readonly CollegeDBContext _dbContext;

        public StudentController(ILogger<StudentController> logger, ICollegeRepository<Student> studentRepository, IMapper mapper, ICollegeRepository<Department> departmentRepository,
    ICollegeRepository<SchoolClass> classRepository,
    ICollegeRepository<Section> sectionRepository, ICollegeRepository<User> userRepository,
    CollegeDBContext dbContext)
        {
            _logger = logger;
            _studentRepository = studentRepository;
            _mapper = mapper;
            _apiResponse = new APIResponse();

            _departmentRepository = departmentRepository;
            _classRepository = classRepository;
            _sectionRepository = sectionRepository;
            _userRepository = userRepository;
            _dbContext = dbContext;
        }

        [HttpGet]
        [Route("All", Name = "GetAllStudents")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentName()
        {
            try
            {
                _logger.LogInformation("GetStudent method started ");

                var students = await _dbContext.Students.AsNoTracking()
                    .Include(s => s.Department)
                    .Include(s => s.SchoolClass)
                    .Include(s => s.Section)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.AcademicYear)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.Department)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.SchoolClass)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.Section)
                    .OrderBy(s => s.AdmissionNumber)
                    .ToListAsync();

                var result = students.Select(s =>
                {
                    var history = (s.StudentAcademicYears ?? new List<StudentAcademicYear>())
                        .OrderByDescending(say => say.AcademicYear != null ? say.AcademicYear.StartDate : DateTime.MinValue)
                        .Select(say => new
                        {
                            id = say.Id,
                            studentId = say.StudentId,
                            academicYearId = say.AcademicYearId,
                            academicYearName = say.AcademicYear != null ? say.AcademicYear.YearName : "",
                            departmentId = say.DepartmentId,
                            departmentName = say.Department != null ? say.Department.DepartmentName : "",
                            schoolClassId = say.SchoolClassId,
                            className = say.SchoolClass != null ? say.SchoolClass.ClassName : "",
                            sectionId = say.SectionId,
                            sectionName = say.Section != null ? say.Section.SectionName : "",
                            rollNumber = say.RollNumber,
                            status = say.Status,
                            isPromoted = say.Status == "Promoted",
                            enrollmentDate = say.EnrollmentDate,
                            promotionDate = say.PromotionDate,
                            remarks = say.Remarks
                        }).ToList();

                    var activeOrLatest = s.StudentAcademicYears?
                        .OrderByDescending(say => say.Status == "Active")
                        .ThenByDescending(say => say.AcademicYear != null ? say.AcademicYear.StartDate : DateTime.MinValue)
                        .FirstOrDefault();

                    return new
                    {
                        id = s.Id,
                        userId = s.UserId,
                        departmentId = activeOrLatest != null ? activeOrLatest.DepartmentId : s.DepartmentId,
                        departmentName = activeOrLatest?.Department?.DepartmentName ?? s.Department?.DepartmentName ?? "",
                        schoolClassId = activeOrLatest != null ? activeOrLatest.SchoolClassId : s.SchoolClassId,
                        className = activeOrLatest?.SchoolClass?.ClassName ?? s.SchoolClass?.ClassName ?? "",
                        sectionId = activeOrLatest != null ? activeOrLatest.SectionId : s.SectionId,
                        sectionName = activeOrLatest?.Section?.SectionName ?? s.Section?.SectionName ?? "",
                        admissionNumber = s.AdmissionNumber,
                        admissionDate = s.AdmissionDate,
                        firstName = s.FirstName,
                        middleName = s.MiddleName,
                        lastName = s.LastName,
                        studentName = (s.FirstName + " " + (s.MiddleName ?? "") + " " + s.LastName).Trim(),
                        fatherName = s.FatherName,
                        motherName = s.MotherName,
                        dob = s.DOB,
                        gender = s.Gender,
                        bloodGroup = s.BloodGroup,
                        photo = s.Photo,
                        aadhaarNumber = s.AadhaarNumber,
                        religion = s.Religion,
                        category = s.Category,
                        nationality = s.Nationality,
                        email = s.Email,
                        phoneNumber = s.PhoneNumber,
                        alternatePhoneNumber = s.AlternatePhoneNumber,
                        address = s.Address,
                        isActive = s.IsActive,
                        status = activeOrLatest != null ? activeOrLatest.Status : (s.IsActive ? "Active" : "Inactive"),
                        isPromoted = activeOrLatest != null && activeOrLatest.Status == "Promoted",
                        rollNumber = activeOrLatest?.RollNumber,
                        academicYearId = activeOrLatest != null ? activeOrLatest.AcademicYearId : (int?)null,
                        academicYearName = activeOrLatest?.AcademicYear != null ? activeOrLatest.AcademicYear.YearName : "",
                        createdBy = s.CreatedBy,
                        createdDate = s.CreatedDate,
                        updatedBy = s.UpdatedBy,
                        updatedDate = s.UpdatedDate,
                        academicHistory = history,
                        studentAcademicYears = history
                    };
                }).ToList();

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }
        }

        [HttpGet("id/{Id}", Name = "GetStudentById")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentById(int Id)
        {
            try
            {
                if (Id <= 0)
                {
                    _logger.LogWarning("Bad Request");
                    return BadRequest();
                }

                var s = await _dbContext.Students.AsNoTracking()
                    .Include(x => x.Department)
                    .Include(x => x.SchoolClass)
                    .Include(x => x.Section)
                    .Include(x => x.StudentAcademicYears)
                        .ThenInclude(say => say.AcademicYear)
                    .Include(x => x.StudentAcademicYears)
                        .ThenInclude(say => say.Department)
                    .Include(x => x.StudentAcademicYears)
                        .ThenInclude(say => say.SchoolClass)
                    .Include(x => x.StudentAcademicYears)
                        .ThenInclude(say => say.Section)
                    .FirstOrDefaultAsync(x => x.Id == Id);

                if (s == null)
                {
                    _logger.LogError("Student not Found with given Id");
                    return NotFound($"The student with id {Id} not found");
                }

                var history = (s.StudentAcademicYears ?? new List<StudentAcademicYear>())
                    .OrderByDescending(say => say.AcademicYear != null ? say.AcademicYear.StartDate : DateTime.MinValue)
                    .Select(say => new
                    {
                        id = say.Id,
                        studentId = say.StudentId,
                        academicYearId = say.AcademicYearId,
                        academicYearName = say.AcademicYear != null ? say.AcademicYear.YearName : "",
                        departmentId = say.DepartmentId,
                        departmentName = say.Department != null ? say.Department.DepartmentName : "",
                        schoolClassId = say.SchoolClassId,
                        className = say.SchoolClass != null ? say.SchoolClass.ClassName : "",
                        sectionId = say.SectionId,
                        sectionName = say.Section != null ? say.Section.SectionName : "",
                        rollNumber = say.RollNumber,
                        status = say.Status,
                        isPromoted = say.Status == "Promoted",
                        enrollmentDate = say.EnrollmentDate,
                        promotionDate = say.PromotionDate,
                        remarks = say.Remarks
                    }).ToList();

                var activeOrLatest = s.StudentAcademicYears?
                    .OrderByDescending(say => say.Status == "Active")
                    .ThenByDescending(say => say.AcademicYear != null ? say.AcademicYear.StartDate : DateTime.MinValue)
                    .FirstOrDefault();

                var result = new
                {
                    id = s.Id,
                    userId = s.UserId,
                    departmentId = activeOrLatest != null ? activeOrLatest.DepartmentId : s.DepartmentId,
                    departmentName = activeOrLatest?.Department?.DepartmentName ?? s.Department?.DepartmentName ?? "",
                    schoolClassId = activeOrLatest != null ? activeOrLatest.SchoolClassId : s.SchoolClassId,
                    className = activeOrLatest?.SchoolClass?.ClassName ?? s.SchoolClass?.ClassName ?? "",
                    sectionId = activeOrLatest != null ? activeOrLatest.SectionId : s.SectionId,
                    sectionName = activeOrLatest?.Section?.SectionName ?? s.Section?.SectionName ?? "",
                    admissionNumber = s.AdmissionNumber,
                    admissionDate = s.AdmissionDate,
                    firstName = s.FirstName,
                    middleName = s.MiddleName,
                    lastName = s.LastName,
                    studentName = (s.FirstName + " " + (s.MiddleName ?? "") + " " + s.LastName).Trim(),
                    fatherName = s.FatherName,
                    motherName = s.MotherName,
                    dob = s.DOB,
                    gender = s.Gender,
                    bloodGroup = s.BloodGroup,
                    photo = s.Photo,
                    aadhaarNumber = s.AadhaarNumber,
                    religion = s.Religion,
                    category = s.Category,
                    nationality = s.Nationality,
                    email = s.Email,
                    phoneNumber = s.PhoneNumber,
                    alternatePhoneNumber = s.AlternatePhoneNumber,
                    address = s.Address,
                    isActive = s.IsActive,
                    status = activeOrLatest != null ? activeOrLatest.Status : (s.IsActive ? "Active" : "Inactive"),
                    isPromoted = activeOrLatest != null && activeOrLatest.Status == "Promoted",
                    rollNumber = activeOrLatest?.RollNumber,
                    academicYearId = activeOrLatest != null ? activeOrLatest.AcademicYearId : (int?)null,
                    academicYearName = activeOrLatest?.AcademicYear != null ? activeOrLatest.AcademicYear.YearName : "",
                    createdBy = s.CreatedBy,
                    createdDate = s.CreatedDate,
                    updatedBy = s.UpdatedBy,
                    updatedDate = s.UpdatedDate,
                    academicHistory = history,
                    studentAcademicYears = history
                };

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }
        }

        [HttpGet("Name/{Name}", Name = "GetStudentByName")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentByName(string Name)
        {
            try
            {
                var students = await _dbContext.Students.AsNoTracking()
                    .Include(s => s.Department)
                    .Include(s => s.SchoolClass)
                    .Include(s => s.Section)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.AcademicYear)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.Department)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.SchoolClass)
                    .Include(s => s.StudentAcademicYears)
                        .ThenInclude(say => say.Section)
                    .Where(s =>
                        s.FirstName.ToLower().Contains(Name.ToLower()) ||
                        (s.MiddleName != null && s.MiddleName.ToLower().Contains(Name.ToLower())) ||
                        s.LastName.ToLower().Contains(Name.ToLower()) ||
                        (s.FirstName + " " + (s.MiddleName ?? "") + " " + s.LastName).ToLower().Contains(Name.ToLower())
                    )
                    .ToListAsync();

                if (students == null || students.Count == 0)
                    return NotFound($"The student with Name {Name} not found");

                var result = students.Select(s =>
                {
                    var history = (s.StudentAcademicYears ?? new List<StudentAcademicYear>())
                        .OrderByDescending(say => say.AcademicYear != null ? say.AcademicYear.StartDate : DateTime.MinValue)
                        .Select(say => new
                        {
                            id = say.Id,
                            studentId = say.StudentId,
                            academicYearId = say.AcademicYearId,
                            academicYearName = say.AcademicYear != null ? say.AcademicYear.YearName : "",
                            departmentId = say.DepartmentId,
                            departmentName = say.Department != null ? say.Department.DepartmentName : "",
                            schoolClassId = say.SchoolClassId,
                            className = say.SchoolClass != null ? say.SchoolClass.ClassName : "",
                            sectionId = say.SectionId,
                            sectionName = say.Section != null ? say.Section.SectionName : "",
                            rollNumber = say.RollNumber,
                            status = say.Status,
                            isPromoted = say.Status == "Promoted",
                            enrollmentDate = say.EnrollmentDate,
                            promotionDate = say.PromotionDate,
                            remarks = say.Remarks
                        }).ToList();

                    var activeOrLatest = s.StudentAcademicYears?
                        .OrderByDescending(say => say.Status == "Active")
                        .ThenByDescending(say => say.AcademicYear != null ? say.AcademicYear.StartDate : DateTime.MinValue)
                        .FirstOrDefault();

                    return new
                    {
                        id = s.Id,
                        userId = s.UserId,
                        departmentId = activeOrLatest != null ? activeOrLatest.DepartmentId : s.DepartmentId,
                        departmentName = activeOrLatest?.Department?.DepartmentName ?? s.Department?.DepartmentName ?? "",
                        schoolClassId = activeOrLatest != null ? activeOrLatest.SchoolClassId : s.SchoolClassId,
                        className = activeOrLatest?.SchoolClass?.ClassName ?? s.SchoolClass?.ClassName ?? "",
                        sectionId = activeOrLatest != null ? activeOrLatest.SectionId : s.SectionId,
                        sectionName = activeOrLatest?.Section?.SectionName ?? s.Section?.SectionName ?? "",
                        admissionNumber = s.AdmissionNumber,
                        admissionDate = s.AdmissionDate,
                        firstName = s.FirstName,
                        middleName = s.MiddleName,
                        lastName = s.LastName,
                        studentName = (s.FirstName + " " + (s.MiddleName ?? "") + " " + s.LastName).Trim(),
                        fatherName = s.FatherName,
                        motherName = s.MotherName,
                        dob = s.DOB,
                        gender = s.Gender,
                        bloodGroup = s.BloodGroup,
                        photo = s.Photo,
                        aadhaarNumber = s.AadhaarNumber,
                        religion = s.Religion,
                        category = s.Category,
                        nationality = s.Nationality,
                        email = s.Email,
                        phoneNumber = s.PhoneNumber,
                        alternatePhoneNumber = s.AlternatePhoneNumber,
                        address = s.Address,
                        isActive = s.IsActive,
                        status = activeOrLatest != null ? activeOrLatest.Status : (s.IsActive ? "Active" : "Inactive"),
                        isPromoted = activeOrLatest != null && activeOrLatest.Status == "Promoted",
                        rollNumber = activeOrLatest?.RollNumber,
                        academicYearId = activeOrLatest != null ? activeOrLatest.AcademicYearId : (int?)null,
                        academicYearName = activeOrLatest?.AcademicYear != null ? activeOrLatest.AcademicYear.YearName : "",
                        createdBy = s.CreatedBy,
                        createdDate = s.CreatedDate,
                        updatedBy = s.UpdatedBy,
                        updatedDate = s.UpdatedDate,
                        academicHistory = history,
                        studentAcademicYears = history
                    };
                }).ToList();

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }
        }


        [HttpPost]
        [Route("Create")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(typeof(GetStudentDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateStudent(
      [FromBody] CreateStudentDTO dto)
        {
            try
            {
                // ============================================
                // VALIDATE DTO
                // ============================================

                if (dto == null)
                {
                    return BadRequest(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        Errors = new List<string>
                {
                    "Student data is required."
                }
                    });
                }

                // ============================================
                // GET LOGGED-IN USER ID
                // ============================================

                var currentUserId =
                    User.FindFirst("UserId")?.Value;

                if (string.IsNullOrWhiteSpace(currentUserId))
                {
                    return Unauthorized(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.Unauthorized,
                        Errors = new List<string>
                {
                    "Logged-in UserId not found."
                }
                    });
                }

                // ============================================
                // CHECK LOGGED-IN USER
                // ============================================

                var currentUser =
                    await _userRepository.GetAsync(
                        u => u.Id == currentUserId
                    );

                if (currentUser == null)
                {
                    return Unauthorized(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.Unauthorized,
                        Errors = new List<string>
                {
                    "Logged-in user does not exist."
                }
                    });
                }

                // ============================================
                // CHECK STUDENT USER
                // ============================================

                var studentUser =
                    await _userRepository.GetAsync(
                        u => u.Id == dto.UserId
                    );

                if (studentUser == null)
                {
                    return BadRequest(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        Errors = new List<string>
                {
                    "Selected student user does not exist."
                }
                    });
                }

                // ============================================
                // CHECK DUPLICATE ADMISSION NUMBER
                // ============================================

                var existingStudent =
                    await _studentRepository.GetAsync(
                        s => s.AdmissionNumber ==
                             dto.AdmissionNumber
                    );

                if (existingStudent != null)
                {
                    return BadRequest(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        Errors = new List<string>
                {
                    "Admission Number already exists."
                }
                    });
                }

                // ============================================
                // MAP DTO -> STUDENT
                // ============================================

                var student =
                    _mapper.Map<Student>(dto);

                // ============================================
                // AUDIT FIELDS
                // ============================================

                student.CreatedBy = currentUserId;
                student.CreatedDate = DateTime.UtcNow;
                student.IsActive = true;

                // ============================================
                // SAVE STUDENT
                // ============================================

                var studentAfterCreation =
                    await _studentRepository.CreateAsync(student);

                // A student must have an enrollment row from their first day.
                // Existing records can be backfilled through StudentPromotion/SyncExisting.
                var currentAcademicYear = await _dbContext.AcademicYears
                    .FirstOrDefaultAsync(y => y.IsCurrent && y.IsActive);
                if (currentAcademicYear != null)
                {
                    _dbContext.StudentAcademicYears.Add(new StudentAcademicYear
                    {
                        StudentId = studentAfterCreation.Id,
                        AcademicYearId = currentAcademicYear.Id,
                        DepartmentId = student.DepartmentId,
                        SchoolClassId = student.SchoolClassId,
                        SectionId = student.SectionId,
                        Status = "Active",
                        EnrollmentDate = DateTime.UtcNow,
                        CreatedBy = currentUserId,
                        CreatedDate = DateTime.UtcNow
                    });
                    await _dbContext.SaveChangesAsync();
                }

                // ============================================
                // VERIFY DATABASE INSERT
                // ============================================

                if (studentAfterCreation == null ||
                    studentAfterCreation.Id <= 0)
                {
                    return StatusCode(
                        StatusCodes.Status500InternalServerError,
                        new APIResponse
                        {
                            Status = false,
                            StatusCode =
                                HttpStatusCode.InternalServerError,
                            Errors = new List<string>
                            {
                        "Student was not saved to database."
                            }
                        }
                    );
                }

                // ============================================
                // GET SAVED RECORD FROM DATABASE
                // ============================================

                var savedStudent =
                    await _studentRepository.GetAsync(
                        s => s.Id == studentAfterCreation.Id
                    );

                if (savedStudent == null)
                {
                    return StatusCode(
                        StatusCodes.Status500InternalServerError,
                        new APIResponse
                        {
                            Status = false,
                            StatusCode =
                                HttpStatusCode.InternalServerError,
                            Errors = new List<string>
                            {
                        "Student insert completed but record could not be retrieved from database."
                            }
                        }
                    );
                }

                // ============================================
                // SUCCESS RESPONSE
                // ============================================

                _apiResponse.Data =
                    _mapper.Map<GetStudentDTO>(
                        savedStudent
                    );

                _apiResponse.Status = true;

                _apiResponse.StatusCode =
                    HttpStatusCode.Created;

                return StatusCode(
                    StatusCodes.Status201Created,
                    _apiResponse
                );
            }
            catch (DbUpdateException ex)
            {
                _apiResponse.Status = false;

                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;

                _apiResponse.Errors.Clear();

                _apiResponse.Errors.Add(
                    "Database update failed."
                );

                _apiResponse.Errors.Add(
                    ex.Message
                );

                if (ex.InnerException != null)
                {
                    _apiResponse.Errors.Add(
                        "Database Error: " +
                        ex.InnerException.Message
                    );
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    _apiResponse
                );
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;

                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;

                _apiResponse.Errors.Clear();

                _apiResponse.Errors.Add(
                    ex.Message
                );

                if (ex.InnerException != null)
                {
                    _apiResponse.Errors.Add(
                        "Inner Exception: " +
                        ex.InnerException.Message
                    );
                }

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    _apiResponse
                );
            }
        }

        [HttpGet("dropdown/department")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetDepartmentDropdown()
        {
            try
            {
                var departments = await _departmentRepository.GetAllAsync();


                var result = departments.Select(d => new
                {
                    id = d.Id,
                    name = d.DepartmentName
                });


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        [HttpGet("dropdown/class")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetClassDropdown(int departmentId)
        {
            try
            {
                if (departmentId <= 0)
                    return BadRequest();

                var classes = await _classRepository.GetAllByFilterAsync(
                    c => c.DepartmentId == departmentId
                );

                var result = classes.Select(c => new
                {
                    id = c.Id,
                    name = c.ClassName
                });

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        [HttpGet("dropdown/section")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetSectionDropdown(int classId)
        {
            try
            {
                if (classId <= 0)
                    return BadRequest();

                var sections = await _sectionRepository.GetAllByFilterAsync(
                    s => s.SchoolClassId == classId
                );

                var result = sections.Select(s => new
                {
                    id = s.Id,
                    name = s.SectionName,
                    schoolClassId = s.SchoolClassId
                });

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        [HttpGet("dropdown/student")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentDropdown(
            int departmentId,
            int classId,
            int sectionId)
        {
            try
            {
                var query = _dbContext.Students.AsNoTracking()
                    .Where(s => s.IsActive);

                if (departmentId > 0)
                    query = query.Where(s => s.DepartmentId == departmentId);
                if (classId > 0)
                    query = query.Where(s => s.SchoolClassId == classId);
                if (sectionId > 0)
                    query = query.Where(s => s.SectionId == sectionId);

                var students = await query.OrderBy(s => s.FirstName).ToListAsync();

                var result = students.Select(s => new
                {
                    id = s.Id,
                    name = (s.FirstName + " " + (s.MiddleName ?? "") + " " + s.LastName).Trim(),
                    admissionNumber = s.AdmissionNumber,
                    departmentId = s.DepartmentId,
                    schoolClassId = s.SchoolClassId,
                    sectionId = s.SectionId
                });

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        [HttpPut("Update/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> UpdateStudent(
            int id,
            [FromBody] UpdateStudentDTO dto)
        {
            try
            {
                if (dto == null || id <= 0)
                {
                    return BadRequest(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.BadRequest,
                        Errors = new List<string>
                        {
                            "Invalid student update request."
                        }
                    });
                }

                // Get logged-in user's ID from JWT
                var currentUserId = User.FindFirst("UserId")?.Value;

                if (string.IsNullOrWhiteSpace(currentUserId))
                {
                    return Unauthorized(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.Unauthorized,
                        Errors = new List<string>
                        {
                            "Logged-in UserId not found."
                        }
                    });
                }

                // Check logged-in user exists
                var currentUser = await _userRepository.GetAsync(
                    u => u.Id == currentUserId
                );

                if (currentUser == null)
                {
                    return Unauthorized(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.Unauthorized,
                        Errors = new List<string>
                        {
                            "Logged-in user does not exist."
                        }
                    });
                }

                // Find existing student
                var existingStudent = await _studentRepository.GetAsync(
                    student => student.Id == id,
                    true
                );

                if (existingStudent == null)
                {
                    return NotFound(new APIResponse
                    {
                        Status = false,
                        StatusCode = HttpStatusCode.NotFound,
                        Errors = new List<string>
                        {
                            $"Student with ID {id} not found."
                        }
                    });
                }

                // Update normal student fields
                _mapper.Map(dto, existingStudent);

                // Set audit information from logged-in user
                existingStudent.UpdatedBy = currentUserId;
                existingStudent.UpdatedDate = DateTime.UtcNow;

                // Save
                await _studentRepository.UpdateAsync(existingStudent);

                // Sync active or latest StudentAcademicYear
                try
                {
                    var activeSay = await _dbContext.StudentAcademicYears
                        .FirstOrDefaultAsync(say => say.StudentId == id && say.Status == "Active");

                    if (activeSay == null)
                    {
                        activeSay = await _dbContext.StudentAcademicYears
                            .OrderByDescending(say => say.AcademicYearId)
                            .FirstOrDefaultAsync(say => say.StudentId == id);
                    }

                    if (activeSay != null)
                    {
                        if (dto.AcademicYearId.HasValue && dto.AcademicYearId.Value > 0)
                            activeSay.AcademicYearId = dto.AcademicYearId.Value;
                        activeSay.DepartmentId = existingStudent.DepartmentId;
                        activeSay.SchoolClassId = existingStudent.SchoolClassId;
                        activeSay.SectionId = existingStudent.SectionId;
                        if (!string.IsNullOrEmpty(dto.RollNumber))
                            activeSay.RollNumber = dto.RollNumber;
                        activeSay.UpdatedBy = currentUserId;
                        activeSay.UpdatedDate = DateTime.UtcNow;
                        await _dbContext.SaveChangesAsync();
                    }
                }
                catch (Exception syncEx)
                {
                    _logger.LogWarning("Failed to sync StudentAcademicYear on student update: {Message}", syncEx.Message);
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Clear();
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        [HttpPatch("PartialStudentUpdate/{id}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> PartialUpdateStudent(
            int id,
            [FromBody] JsonPatchDocument<PatchStudentDTO> patchDocument)
        {
            try
            {
                if (patchDocument == null || id <= 0)
                {
                    return BadRequest();
                }

                var existingStudent = await _studentRepository.GetAsync(
                    s => s.Id == id, true);

                if (existingStudent == null)
                {
                    return NotFound();
                }

                var patchStudentDTO = _mapper.Map<PatchStudentDTO>(existingStudent);

                patchDocument.ApplyTo(patchStudentDTO, ModelState);

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _mapper.Map(patchStudentDTO, existingStudent);

                await _studentRepository.UpdateAsync(existingStudent);

                return NoContent();
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }
        }

        [HttpDelete("{Id}", Name = "DeleteStudentById")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(typeof(Student), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> DeleteStudentById(int Id)
        {
            try
            {
                if (Id <= 0)
                    return BadRequest();
                var student = await _studentRepository.GetAsync(student => student.Id == Id);

                if (student == null)
                {
                    return NotFound($"No Student Found with Id: {Id}");
                }

                await _studentRepository.DeleteAsync(student);
                _apiResponse.Data = true;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok("Student deleted successfully");
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }
        }
    }
}
