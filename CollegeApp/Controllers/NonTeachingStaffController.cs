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
        private readonly ILogger<NonTeachingStaffController> _logger;
        private readonly INonTeachingStaffService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;

        public NonTeachingStaffController(IMapper mapper, ILogger<NonTeachingStaffController> logger, INonTeachingStaffService service, ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();
            
        }
        [HttpPost]
        [Route("CreateStaff")]
        [Authorize(Roles = "Super Admin,Admin")]
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
        [Authorize(Roles = "Super Admin,Admin")]
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



        // =====================================================
        // GET BY STAFF CODE
        // =====================================================
        [HttpGet("StaffCode/{code}")]
        [Authorize(Roles = "Super Admin,Admin,NonTeachingStaff")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonTeachingStaffByCodeAsync(
            string code)
        {
            try
            {
                var staff = await _service.GetNonTeachingStaffByCodeAsync(code);

                if (staff == null)
                {
                    _apiResponse.Status = false;
                    _apiResponse.StatusCode = HttpStatusCode.NotFound;
                    _apiResponse.Errors.Add(
                        $"Staff with code '{code}' not found."
                    );

                    return NotFound(_apiResponse);
                }

                // SuperAdmin and Admin can access all staff
                if (!_currentUserService.IsInRole("Super Admin") &&
                    !_currentUserService.IsInRole("Admin"))
                {
                    // NonTeachingStaff can access only their own record
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
            catch (ArgumentException ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.BadRequest;
                _apiResponse.Errors.Add(ex.Message);

                return BadRequest(_apiResponse);
            }
            catch (KeyNotFoundException ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.NotFound;
                _apiResponse.Errors.Add(ex.Message);

                return NotFound(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors.Add(ex.Message);

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    _apiResponse
                );
            }
        }


        // =====================================================
        // GET BY STAFF NAME
        // =====================================================
        [HttpGet("Name/{name}")]
        [Authorize(Roles = "Super Admin,Admin,NonTeachingStaff")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonTeachingStaffByNameAsync(
            string name)
        {
            try
            {
                var staff = await _service.GetNonTeachingStaffByNameAsync(name);

                if (staff == null || !staff.Any())
                {
                    _apiResponse.Status = false;
                    _apiResponse.StatusCode = HttpStatusCode.NotFound;
                    _apiResponse.Errors.Add(
                        $"No staff found with name '{name}'."
                    );

                    return NotFound(_apiResponse);
                }

                // SuperAdmin and Admin can access all staff
                if (!_currentUserService.IsInRole("Super Admin") &&
                    !_currentUserService.IsInRole("Admin"))
                {
                    // NonTeachingStaff can access only their own record
                    if (staff.Any(x =>
                        x.UserId != _currentUserService.UserId))
                    {
                        return Forbid();
                    }
                }

                _apiResponse.Data = staff;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (ArgumentException ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.BadRequest;
                _apiResponse.Errors.Add(ex.Message);

                return BadRequest(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors.Add(ex.Message);

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    _apiResponse
                );
            }
        }

        // =====================================================
        // GET NON-TEACHING STAFF DROPDOWN
        // =====================================================
        [HttpGet("dropdown")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;

                _apiResponse.Errors.Add(ex.Message);

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    _apiResponse
                );
            }
        }





        [HttpPut("UpdateStaff/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
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
        [Authorize(Roles = "Super Admin,Admin")]
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
