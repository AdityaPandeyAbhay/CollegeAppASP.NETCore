using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Repository.InterfaceOfRepository;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.EntityFrameworkCore;
using System.Net;
using Microsoft.AspNetCore.Authorization;


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

        private readonly IMapper _mapper;
        private APIResponse _apiResponse;


        public StudentController(ILogger<StudentController> logger, ICollegeRepository<Student> studentRepository, IMapper mapper)
        {
            _logger = logger;
            _studentRepository = studentRepository;
            _mapper = mapper;
            _apiResponse = new APIResponse();

        }





        [HttpGet]
        [Route("All", Name = "GetAllStudents")]
        //[Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(typeof(StudentDTO), StatusCodes.Status200OK)]
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
                _apiResponse.Data = _mapper.Map<List<StudentDTO>>(student);
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
        // [ProducesResponseType(typeof(Student), StatusCodes.Status200OK)]
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

                _apiResponse.Data = _mapper.Map<StudentDTO>(student);
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
         // [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(typeof(Student), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentByName(string Name)
        {

            try
            {

                var student = await _studentRepository.GetAsync(student => student.StudentName.ToLower().Contains(Name.ToLower()));
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


                _apiResponse.Data = _mapper.Map<StudentDTO>(student);
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
        //[Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(typeof(StudentDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateStudent([FromBody] StudentDTO dto)
        {

            try
            {
                //    if (!ModelState.IsValid)
                //    {
                //        return BadRequest(ModelState);
                //    }
                if (dto == null)
                {
                    return BadRequest();
                }

                //Student student = new Student
                //{

                //    StudentName = model.StudentName,
                //    Email = model.Email,
                //    Address = model.Address,
                //    DOB = model.DOB,

                //};

                Student student = _mapper.Map<Student>(dto);



                var studentAfterCreation = await _studentRepository.CreateAsync(student);
                dto.Id = studentAfterCreation.Id;
                _apiResponse.Data = dto;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return CreatedAtRoute("GetStudentById", new { id = dto.Id }, _apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;

            }

        }





        [HttpPut]
        [Route("Update")]
        //[Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> UpdateStudent([FromBody] StudentDTO dto)
        {
            try
            {

                if (dto == null || dto.Id <= 0)
                {
                    return BadRequest();

                }
                var existingStudent = await _studentRepository.GetAsync(student => student.Id == dto.Id, true);
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


                var newStudent = _mapper.Map<Student>(dto);

                await _studentRepository.UpdateAsync(newStudent);



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





        [HttpPatch("PartialUpdate/{Id}")]
        //[Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse >> PartialUpdateStudent(
    int Id,
    [FromBody] JsonPatchDocument<StudentDTO> patchDocument)
        {
            try
            {
                if (patchDocument == null || Id <= 0)
                {
                    return BadRequest();

                }
                var existingStudent = await _studentRepository.GetAsync(student => student.Id == Id, true);
                if (existingStudent == null)
                {
                    return NotFound();
                }
                //var studentDTO = new StudentDTO
                //{
                //    Id = existingStudent.Id,
                //    StudentName = existingStudent.StudentName,
                //    Email = existingStudent.Email,
                //    DOB = existingStudent.DOB,
                //};

                var studentDTO = _mapper.Map<StudentDTO>(existingStudent);
                patchDocument.ApplyTo(studentDTO, ModelState);

                //existingStudent.StudentName = studentDTO.StudentName;
                //existingStudent.Email = studentDTO.Email;
                //existingStudent.Address = studentDTO.Address;
                //existingStudent.DOB = studentDTO.DOB;

                _mapper.Map(studentDTO, existingStudent);

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
        //[Authorize(Roles = "Super Admin,Admin")]
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


