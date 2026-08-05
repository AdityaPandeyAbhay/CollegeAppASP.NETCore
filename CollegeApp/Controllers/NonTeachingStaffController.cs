using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Data.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models.NonTeachingStaff;
using Model.Models.Teacher_Model;
using Service.InterfaceOfService;
using System.Net;
using System.Security.Claims;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NonTeachingStaffController :ControllerBase
    {

        private readonly IMapper _mapper;
        private readonly ILogger _logger;
        private readonly INonTeachingStaffService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;

        public NonTeachingStaffController(IMapper mapper, ILogger logger, INonTeachingStaffService service, ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();
            
        }
        [HttpPost]
        [Route("CreateStaff")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> CreateNonTeachingStaffAsync(CreateNonTeachingStaffDTO dto)
        { try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var staff = await _service.CreateNonTeachingStaffAsync(dto);

                _apiResponse.Data = staff;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;
                return Ok(_apiResponse);


            }
            catch(Exception ex) 
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;

            }
        }




        [HttpGet]
        [Route("AllNonTeachingStoff")]
        [Authorize(Roles = "SuperAdmin,Admin")]
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
                var staff = await _service.GetNonTeachingStaffAsync();
                if(staff == null)
                {
                    throw new ArgumentNullException(nameof(staff));
                }
                _apiResponse.Data = staff;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors.Add($"{ex.Message}");
                return _apiResponse;
            }
        }



        [HttpGet("StaffCode/{Code}")]
        [Authorize(Roles = "SuperAdmin,Admin,NonTeachingStaff")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetTeacherByCodeAsync(string code)
        {
            try
            {

                var staff = await _service.GetNonTeachingStaffByCodeAsync(code);

                if (staff == null)
                {
                    throw new Exception($"User are not found on {code} code");
                }

                // SuperAdmin/Admin can access all staff
                if (!_currentUserService.IsInRole("SuperAdmin") &&
                    !_currentUserService.IsInRole("Admin"))
                {
                    // Teacher can access only their own record
                    if (staff.UserId != _currentUserService.UserId)
                    {
                        return Forbid();
                    }
                }


                _apiResponse.Data = staff;
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
        [Authorize(Roles = "SuperAdmin,Admin,NonTeachingStaff")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetNonTeachingStaffByNameAsync(string Name)
        {
            try
            {
                var staff = await _service.GetNonTeachingStaffByNameAsync(Name);

                if (staff == null || !staff.Any())
                {
                    return NotFound();
                }

                if (!_currentUserService.IsInRole("SuperAdmin") &&
                    !_currentUserService.IsInRole("Admin"))
                {
                    if (staff.Any(x => x.UserId != _currentUserService.UserId))
                    {
                        return Forbid();
                    }
                }



                _apiResponse.Data = staff;
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


        [HttpGet("dropdown")]
        [Authorize(Roles = "SuperAdmin,Admin")]

        [Authorize(Roles = "SuperAdmin,Admin,NonTeachingStaff")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetNonTeachingStaffDropdown()
        {
            try
            {
                var staff =
                    await _service.GetNonTeachingStaffDropdownAsync();


                _apiResponse.Data = staff;
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






        [HttpPut("UpdateStaff/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> UpdateNonTeachingStaffAsync(int id, UpdateNonTeachingStaffDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var staff = await _service.UpdateNonTeachingStaffAsync(id, dto);
                _apiResponse.Data = staff;
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




        [HttpDelete("DeleteStaff/{code}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> DeleteStaffAsync(string code)
        {
            try
            {


                await _service.DeleteNonTeachingStaffAsync(code);



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
