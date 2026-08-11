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

        public StudentController(ILogger<StudentController> logger, ICollegeRepository<Student> studentRepository, IMapper mapper, ICollegeRepository<Department> departmentRepository,
    ICollegeRepository<SchoolClass> classRepository,
    ICollegeRepository<Section> sectionRepository, ICollegeRepository<User> userRepository)
        {
            _logger = logger;
            _studentRepository = studentRepository;
            _mapper = mapper;
            _apiResponse = new APIResponse();

            _departmentRepository = departmentRepository;
            _classRepository = classRepository;
            _sectionRepository = sectionRepository;
            _userRepository = userRepository;


        }





        [HttpGet]
        [Route("All", Name = "GetAllStudents")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(typeof(GetStudentDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentName()
        {
            try
            {
                _logger.LogInformation("GetStudent method started ");
                //Mapping Manually (Student to StudeentDTO)

                //var students = await _dbContext.Students.Select(s => new StudentDTO()
                //{
                //    Id = s.Id,
                //    StudentName = s.StudentName,
                //    Address = s.Address,
                //    Email = s.Email,
                //    DOB = s.DOB,

                //}).ToListAsync();
                //return Ok(students);

                // Automapping 
                var student = await _studentRepository.GetAllAsync();
                _apiResponse.Data = _mapper.Map<List<GetStudentDTO>>(student);
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
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(typeof(Student), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentById(int Id)
        {
            try
            {

                if (Id <= 0)
                {
                    _logger.LogWarning("Bed Request");
                    return BadRequest();
                }
                var student = await _studentRepository.GetAsync(student => student.Id == Id);
                if (student == null)
                {
                    _logger.LogError("Student not Found with given Id");
                    return NotFound($"The student with id {Id} not found");
                }
                //Mapping Manually
                //var studentDTO = new StudentDTO
                //{
                //    Id = student.Id,
                //    StudentName = student.StudentName,
                //    Email = student.Email,
                //    Address = student.Address,
                //    DOB = student.DOB,

                //};
                // Automapping 

                _apiResponse.Data = _mapper.Map<GetStudentDTO>(student);
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
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(typeof(Student), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentByName(string Name)
        {

            try
            {

                var student = await _studentRepository.GetAsync(s =>
            s.FirstName.ToLower().Contains(Name.ToLower()) ||
            (s.MiddleName != null && s.MiddleName.ToLower().Contains(Name.ToLower())) ||
            s.LastName.ToLower().Contains(Name.ToLower())
        );

                if (student == null)
                    return NotFound($"The student with Name {Name} not found");
                //var studentDTO = new StudentDTO
                //{
                //    Id = student.Id,
                //    StudentName = student.StudentName,
                //    Email = student.Email,
                //    Address = student.Address,
                //    DOB = student.DOB,

                //};


                _apiResponse.Data = _mapper.Map<GetStudentDTO>(student);
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
        [ProducesResponseType(typeof(CreateStudentDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateStudent(
     [FromBody] CreateStudentDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest();
                }

                // ============================================
                // GET LOGGED-IN USER ID FROM JWT
                // ============================================

                var currentUserId = User.FindFirst("UserId")?.Value;

                if (string.IsNullOrWhiteSpace(currentUserId))
                {
                    return Unauthorized("Logged-in UserId not found.");
                }

                // ============================================
                // CHECK WHETHER LOGGED-IN USER EXISTS
                // ============================================

                var currentUser = await HttpContext.RequestServices
                    .GetRequiredService<ICollegeRepository<User>>()
                    .GetAsync(u => u.Id == currentUserId);

                if (currentUser == null)
                {
                    return Unauthorized("Logged-in user does not exist.");
                }

                // ============================================
                // MAP DTO → STUDENT
                // ============================================

                Student student = _mapper.Map<Student>(dto);

                // ============================================
                // SET AUDIT FIELDS
                // ============================================

                student.CreatedBy = currentUserId;
                student.CreatedDate = DateTime.UtcNow;
                student.IsActive = true;

                // ============================================
                // CREATE STUDENT
                // ============================================

                var studentAfterCreation =
                    await _studentRepository.CreateAsync(student);

                // ============================================
                // RESPONSE
                // ============================================

                _apiResponse.Data = _mapper.Map<GetStudentDTO>(
                    studentAfterCreation
                );

                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;

                return StatusCode(
                    StatusCodes.Status201Created,
                    _apiResponse
                );
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;

                _apiResponse.Errors.Add(ex.Message);

                if (ex.InnerException != null)
                {
                    _apiResponse.Errors.Add(
                        "Inner Exception: " +
                        ex.InnerException.Message
                    );

                    if (ex.InnerException.InnerException != null)
                    {
                        _apiResponse.Errors.Add(
                            "Database Error: " +
                            ex.InnerException.InnerException.Message
                        );
                    }
                }

                return _apiResponse;
            }
        }


        [HttpGet("dropdown/department")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
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
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetClassDropdown(
    int departmentId)
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
                _apiResponse.StatusCode =
                HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }




        [HttpGet("dropdown/section")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetSectionDropdown(
    int classId)
        {
            try
            {

                if (classId <= 0)
                    return BadRequest();


                var sections =
                    await _sectionRepository.GetAllByFilterAsync(
                        s => s.SchoolClassId == classId
                    );


                var result = sections.Select(s => new
                {
                    id = s.Id,
                    name = s.SectionName
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
                _apiResponse.StatusCode =
                HttpStatusCode.InternalServerError;


                return _apiResponse;

            }
        }



        [HttpGet("dropdown/student")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentDropdown(
    int departmentId,
    int classId,
    int sectionId)
        {
            try
            {

                var students =
                    await _studentRepository.GetAllByFilterAsync(
                    s =>
                    s.DepartmentId == departmentId &&
                    s.SchoolClassId == classId &&
                    s.SectionId == sectionId
                    );


                var result = students.Select(s => new
                {
                    id = s.Id,

                    name =
                    s.FirstName + " " +
                    (s.MiddleName ?? "") +
                    " " +
                    s.LastName
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
                _apiResponse.StatusCode =
                HttpStatusCode.InternalServerError;


                return _apiResponse;

            }
        }







        [HttpPut("Update/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> UpdateStudent(int id,[FromBody] UpdateStudentDTO dto)
        {
            try
            {

                if (dto == null || id <= 0)
                {
                    return BadRequest();

                }
                var existingStudent = await _studentRepository.GetAsync(student => student.Id == id, true);
                if (existingStudent == null)
                {
                    return NotFound();
                }

                //var newStudent = new Student
                //{
                //    Id = existingStudent.Id,
                //    StudentName = model.StudentName,
                //    Email = model.Email
                //    Address = model.Address,
                //    DOB = model.DOB,
                //};



                //existingStudent.StudentName = model.StudentName;
                //existingStudent.Email = model.Email;
                //existingStudent.Address = model.Address;
                //existingStudent.DOB = model.DOB;


                _mapper.Map(dto, existingStudent);
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
            ;

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


