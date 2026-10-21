using AutoMapper;
using CollegeApp.Models;
using CollegeApp.Services;
using Data.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Teacher_Model;
using Service.ClassOfService;
using Service.InterfaceOfService;
using System.Net;
using System.Security.Claims;




namespace CollegeApp.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class TeacherController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<TeacherController> _logger;
        private readonly ITeacherService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;

        public TeacherController(IMapper mapper, ILogger<TeacherController> logger, ITeacherService service, ICurrentUserServices currentUserService)
        {
            _apiResponse = new();
            _mapper = mapper;
            _service = service;
            _logger = logger;
            _currentUserService = currentUserService;

        }

        [HttpPost]
        [Route("CreateTeacher")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> CreateTeacherApiAsync(CreateTeacherDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    throw new Exception("Invalid request");
                }

                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var teacher = await _service.CreateTeacherAsync(dto);


                _apiResponse.Data = teacher;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;

            }
        }


        [HttpGet]
        [Route("AllTeacher")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetAllTeacherAsync()
        {
            try
            {
                var teachet = await _service.GetAllTeacherAsync();
                _apiResponse.Data = teachet;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                _apiResponse.Status = true;
                return _apiResponse;

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;

            }
        }


        [HttpGet("TeacherCode/{code}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetTeacherByCodeAsync(string code)
        {
            try
            {
                var teacher = await _service.GetByTeacherCodeAsync(code);

                if (teacher == null)
                {
                    return NotFound();
                }

                if (!_currentUserService.IsInRole("Super Admin") &&
                    !_currentUserService.IsInRole("Admin") &&
                    !_currentUserService.IsInRole("Operator"))
                {
                    if (teacher.UserId != _currentUserService.UserId)
                    {
                        return Forbid();
                    }
                }

                _apiResponse.Data = teacher;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpGet("Name/{Name}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetTeacherByNameAsync(string Name)
        {
            try
            {
                var teachers = await _service.GetTeacherByNameAsync(Name);

                if (teachers == null || !teachers.Any())
                {
                    return NotFound();
                }

                if (!_currentUserService.IsInRole("Super Admin") &&
                    !_currentUserService.IsInRole("Admin") &&
                    !_currentUserService.IsInRole("Operator"))
                {
                    if (teachers.Any(x => x.UserId != _currentUserService.UserId))
                    {
                        return Forbid();
                    }
                }

                _apiResponse.Data = teachers;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex) {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }




        [HttpGet("dropdown")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetTeacherDropdown(
    int? schoolClassId,
    int? subjectId)
        {
            try
            {
                var result =
                    await _service.GetTeacherDropdownAsync(
                        schoolClassId,
                        subjectId
                    );


                if (result == null || !result.Any())
                {
                    return NotFound();
                }


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }




        [HttpPut("UpdateTeacher/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> UpdateTeacherAsync(int id,UpdateTeacherDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var teacher = await _service.UpdateTeacherAsync(id,dto);
                _apiResponse.Data = teacher;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK; 
                return Ok(_apiResponse);
            }
            catch (Exception ex) {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }

        }




        [HttpDelete("DeleteTeacher/{code}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> DeleteTeacherAsync(string code)
        {
            try
            {

               
                await _service.DeleteTeacherAsync(code);



                _apiResponse.Data = true;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }





    }
}