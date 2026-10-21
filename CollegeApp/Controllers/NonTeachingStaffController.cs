using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Data.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models;
using Model.Models.NonTeachingStaff;
using Service.InterfaceOfService;
using System.Net;
using System.Security.Claims;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    [Produces("application/json")]
    public class NonTeachingStaffController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<NonTeachingStaffController> _logger;
        private readonly INonTeachingStaffService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;

        public NonTeachingStaffController(
            IMapper mapper,
            ILogger<NonTeachingStaffController> logger,
            INonTeachingStaffService service,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();
        }

        // =====================================================
        // CREATE NON-TEACHING STAFF
        // POST: /api/NonTeachingStaff/CreateStaff
        // =====================================================
        [HttpPost("CreateStaff")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(typeof(GetNonTeachingStaffDTO), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> CreateNonTeachingStaffAsync([FromBody] CreateNonTeachingStaffDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _apiResponse.Status = false;
                    _apiResponse.StatusCode = HttpStatusCode.BadRequest;
                    _apiResponse.Errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(_apiResponse);
                }

                var staff = await _service.CreateNonTeachingStaffAsync(dto);

                _apiResponse.Data = staff;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;
                return StatusCode(StatusCodes.Status201Created, _apiResponse);
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
                var fullMessage = ex.InnerException != null
                    ? $"{ex.Message} -> {ex.InnerException.Message}"
                    : ex.Message;
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(fullMessage);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }

        // =====================================================
        // GET ALL NON-TEACHING STAFF
        // GET: /api/NonTeachingStaff/AllNonTeachingStaff
        // =====================================================
        [HttpGet("AllNonTeachingStaff")]
        [Authorize(Roles = "Super Admin,Admin,Operator,Office Employee")]
        [ProducesResponseType(typeof(List<GetNonTeachingStaffDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAllNonTeachingStaffAsync()
        {
            try
            {
                var staff = await _service.GetNonTeachingStaffAsync();
                _apiResponse.Data = staff;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors.Add(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }

        // =====================================================
        // GET BY STAFF CODE
        // GET: /api/NonTeachingStaff/StaffCode/{code}
        // =====================================================
        [HttpGet("StaffCode/{code}")]
        [Authorize(Roles = "Super Admin,Admin,NonTeachingStaff,Operator,Office Employee")]
        [ProducesResponseType(typeof(GetNonTeachingStaffDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonTeachingStaffByCodeAsync(string code)
        {
            try
            {
                var staff = await _service.GetNonTeachingStaffByCodeAsync(code);

                if (staff == null)
                {
                    _apiResponse.Status = false;
                    _apiResponse.StatusCode = HttpStatusCode.NotFound;
                    _apiResponse.Errors.Add($"Staff with code '{code}' not found.");
                    return NotFound(_apiResponse);
                }

                // Role check: NonTeachingStaff can access only their own record
                if (!_currentUserService.IsInRole("Super Admin") &&
                    !_currentUserService.IsInRole("Admin") &&
                    !_currentUserService.IsInRole("Operator") &&
                    !_currentUserService.IsInRole("Office Employee"))
                {
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
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }

        // =====================================================
        // GET BY STAFF NAME
        // GET: /api/NonTeachingStaff/Name/{name}
        // =====================================================
        [HttpGet("Name/{name}")]
        [Authorize(Roles = "Super Admin,Admin,NonTeachingStaff,Operator,Office Employee")]
        [ProducesResponseType(typeof(List<GetNonTeachingStaffDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonTeachingStaffByNameAsync(string name)
        {
            try
            {
                var staff = await _service.GetNonTeachingStaffByNameAsync(name);

                if (staff == null || !staff.Any())
                {
                    _apiResponse.Status = false;
                    _apiResponse.StatusCode = HttpStatusCode.NotFound;
                    _apiResponse.Errors.Add($"No staff found with name '{name}'.");
                    return NotFound(_apiResponse);
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
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }

        // =====================================================
        // GET NON-TEACHING STAFF DROPDOWN
        // GET: /api/NonTeachingStaff/dropdown
        // =====================================================
        [HttpGet("dropdown")]
        [Authorize(Roles = "Super Admin,Admin,Operator,Office Employee")]
        [ProducesResponseType(typeof(List<DropdownDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonTeachingStaffDropdown()
        {
            try
            {
                var staff = await _service.GetNonTeachingStaffDropdownAsync();
                _apiResponse.Data = staff;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors.Add(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }

        // =====================================================
        // UPDATE NON-TEACHING STAFF
        // PUT: /api/NonTeachingStaff/UpdateStaff/{identifier}
        // Accepts staffCode (e.g. 'NTS001') or numeric Id (e.g. '5')
        // =====================================================
        [HttpPut("UpdateStaff/{identifier}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> UpdateNonTeachingStaffAsync(string identifier, [FromBody] UpdateNonTeachingStaffDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _apiResponse.Status = false;
                    _apiResponse.StatusCode = HttpStatusCode.BadRequest;
                    _apiResponse.Errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(_apiResponse);
                }

                bool success;
                if (int.TryParse(identifier, out int id))
                {
                    success = await _service.UpdateNonTeachingStaffAsync(id, dto);
                }
                else
                {
                    success = await _service.UpdateNonTeachingStaffByCodeAsync(identifier, dto);
                }

                _apiResponse.Data = success;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                var fullMessage = ex.InnerException != null
                    ? $"{ex.Message} -> {ex.InnerException.Message}"
                    : ex.Message;
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(fullMessage);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }

        // =====================================================
        // DELETE NON-TEACHING STAFF
        // DELETE: /api/NonTeachingStaff/DeleteStaff/{code}
        // Accepts staffCode (e.g. 'NTS001') or numeric Id (e.g. '5')
        // =====================================================
        [HttpDelete("DeleteStaff/{code}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(APIResponse), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> DeleteStaffAsync(string code)
        {
            try
            {
                await _service.DeleteNonTeachingStaffAsync(code);

                _apiResponse.Data = true;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }
    }
}
