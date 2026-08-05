using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Attendance_Model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _service;
        private readonly APIResponse _apiResponse;
        private readonly ILogger<AttendanceController> _logger;

        public AttendanceController(
            IAttendanceService service,
            ILogger<AttendanceController> logger)
        {
            _service = service;
            _logger = logger;
            _apiResponse = new APIResponse();
        }

        //==================================================
        // Get Students For Attendance
        //==================================================

        [HttpGet("GetStudents/{teacherAssignmentId:int}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetStudents(int teacherAssignmentId)
        {
            try
            {
                var students =
                    await _service.GetStudentsForAttendanceAsync(teacherAssignmentId);

                _apiResponse.Data = students;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        //==================================================
        // Take Attendance
        //==================================================

        [HttpPost("TakeAttendance")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> TakeAttendance(
            TakeAttendanceDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var attendance =
                    await _service.TakeAttendanceAsync(dto);

                _apiResponse.Data = attendance;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        //==================================================
        // Get Attendance
        //==================================================

        [HttpGet("GetAttendance/{teacherAssignmentId:int}/{attendanceDate}")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAttendance(
            int teacherAssignmentId,
            DateOnly attendanceDate)
        {
            try
            {
                var attendance =
                    await _service.GetAttendanceAsync(
                        teacherAssignmentId,
                        attendanceDate);

                if (attendance == null)
                    return NotFound();

                _apiResponse.Data = attendance;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        //==================================================
        // Update Attendance
        //==================================================

        [HttpPut("UpdateAttendance")]
        [Authorize(Roles = "Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> UpdateAttendance(
            UpdateAttendanceDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result =
                    await _service.UpdateAttendanceAsync(dto);

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }
    }
}