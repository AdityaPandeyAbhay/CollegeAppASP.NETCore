using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using CollegeApp.Models;
using CollegeApp.Services;
using Microsoft.AspNetCore.Authorization;
using Model.Models.TeacherAssignment_Model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TeacherAssignmentController : ControllerBase
    {
        private readonly ITeacherAssignmentService _teacherAssignmentService;
        private readonly ILogger<TeacherAssignmentController> _logger;
        private readonly APIResponse _response;
        private readonly ICurrentUserServices _currentUserService;

        public TeacherAssignmentController(
            ITeacherAssignmentService teacherAssignmentService,
            ILogger<TeacherAssignmentController> logger,
            ICurrentUserServices currentUserService)
        {
            _teacherAssignmentService = teacherAssignmentService;
            _logger = logger;
            _currentUserService = currentUserService;
            _response = new APIResponse();
        }

        #region Get All Teacher Assignments

        [HttpGet]
        [Route("GetAllTeacherAssignments")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAllTeacherAssignments()
        {
            try
            {
                var result = await _teacherAssignmentService.GetAllTeacherAssignmentAsync();

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.InternalServerError;

                return StatusCode(StatusCodes.Status500InternalServerError, _response);
            }
        }

        #endregion

        #region Get Teacher Assignment By Id

        [HttpGet]
        [Route("GetTeacherAssignmentById/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetTeacherAssignmentById(int id)
        {
            try
            {
                var result = await _teacherAssignmentService.GetTeacherAssignmentByIdAsync(id);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.NotFound;

                return NotFound(_response);
            }
        }

        #endregion

        #region Get Teacher Assignment By Teacher

        [HttpGet]
        [Route("GetTeacherAssignmentByTeacher/{teacherId:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetTeacherAssignmentByTeacher(int teacherId)
        {
            try
            {
                var result = await _teacherAssignmentService.GetTeacherAssignmentByTeacherAsync(teacherId);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.NotFound;

                return NotFound(_response);
            }
        }

        #endregion

        #region Get Teacher Assignment By Class

        [HttpGet]
        [Route("GetTeacherAssignmentByClass/{classId:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetTeacherAssignmentByClass(int classId)
        {
            try
            {
                var result = await _teacherAssignmentService.GetTeacherAssignmentByClassAsync(classId);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.NotFound;

                return NotFound(_response);
            }
        }

        #endregion

        #region Get Teacher Assignment By Subject

        [HttpGet]
        [Route("GetTeacherAssignmentBySubject/{subjectId:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetTeacherAssignmentBySubject(int subjectId)
        {
            try
            {
                var result = await _teacherAssignmentService.GetTeacherAssignmentBySubjectAsync(subjectId);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.NotFound;

                return NotFound(_response);
            }
        }

        #endregion

        #region Create Teacher Assignment

        [HttpPost]
        [Route("CreateTeacherAssignment")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateTeacherAssignment(CreateTeacherAssignmentDTO dto)
        {
            try
            {
                var result = await _teacherAssignmentService.CreateTeacherAssignmentAsync(dto);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.Created;

                return StatusCode(StatusCodes.Status201Created, _response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.BadRequest;

                return BadRequest(_response);
            }
        }

        #endregion


        [HttpGet]
        [Route("dropdown/teacher")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]

        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetTeacherDropdown(
    [FromQuery] int? departmentId,
    [FromQuery] int? schoolClassId,
    [FromQuery] int? sectionId,
    [FromQuery] int? subjectId,
    [FromQuery] int? academicYearId)
        {
            try
            {
                var result =
                    await _teacherAssignmentService
                        .GetTeacherDropdownAsync(
                            departmentId,
                            schoolClassId,
                            sectionId,
                            subjectId,
                            academicYearId);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Data = null;
                _response.Errors.Add(ex.Message);
                _response.StatusCode =
                    HttpStatusCode.InternalServerError;

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    _response);
            }
        }



        #region Update Teacher Assignment

        [HttpPut]
        [Route("UpdateTeacherAssignment/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> UpdateTeacherAssignment(int id, UpdateTeacherAssignmentDTO dto)
        {
            try
            {
                var result = await _teacherAssignmentService.UpdateTeacherAssignmentAsync(id, dto);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.BadRequest;

                return BadRequest(_response);
            }
        }

        #endregion

        #region Delete Teacher Assignment

        [HttpDelete]
        [Route("DeleteTeacherAssignment/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> DeleteTeacherAssignment(int id)
        {
            try
            {
                var result = await _teacherAssignmentService.DeleteTeacherAssignmentAsync(id);

                _response.Status = true;
                _response.Data = result;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.NotFound;

                return NotFound(_response);
            }
        }

        #endregion
    }
}