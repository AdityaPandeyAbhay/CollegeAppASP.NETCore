using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Model.Models.Fee_Model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StudentFeeController : ControllerBase
    {
        private readonly IStudentFeeService _studentFeeService;
        private readonly ILogger<StudentFeeController> _logger;
        private readonly APIResponse _response;

        public StudentFeeController(
            IStudentFeeService studentFeeService,
            ILogger<StudentFeeController> logger)
        {
            _studentFeeService = studentFeeService;
            _logger = logger;
            _response = new APIResponse();
        }

        #region Get All Student Fees

        [HttpGet]
        [Route("GetAllStudentFees")]
        [Authorize(Roles = "Super Admin,Admin,Accountant,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<APIResponse>> GetAllStudentFees()
        {
            try
            {
                _response.Data = await _studentFeeService.GetAllStudentFeeAsync();
                _response.Status = true;
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

        #region Get Student Fee By Id

        [HttpGet]
        [Route("GetStudentFeeById/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Accountant,Student,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentFeeById(int id)
        {
            try
            {
                _response.Data = await _studentFeeService.GetStudentFeeByIdAsync(id);
                _response.Status = true;
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

        #region Get Student Fee By Student Id

        [HttpGet]
        [Route("GetStudentFeeByStudentId/{studentId:int}")]
        [Authorize(Roles = "Super Admin,Admin,Accountant,Student,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentFeeByStudentId(int studentId)
        {
            try
            {
                _response.Data = await _studentFeeService.GetStudentFeeByStudentAsync(studentId);
                _response.Status = true;
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

        #region Get Student Fee By Student Name

        [HttpGet]
        [Route("GetStudentFeeByStudentName/{studentName}")]
        [Authorize(Roles = "Super Admin,Admin,Accountant,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetStudentFeeByStudentName(string studentName)
        {
            try
            {
                _response.Data = await _studentFeeService.GetStudentFeeByStudentNameAsync(studentName);
                _response.Status = true;
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

        #region Create Student Fee

        [HttpPost]
        [Route("CreateStudentFee")]
        [Authorize(Roles = "Super Admin,Admin,Accountant")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateStudentFee(CreateStudentFeeDTO dto)
        {
            try
            {
                _response.Data = await _studentFeeService.CreateStudentFeeAsync(dto);
                _response.Status = true;
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


        #region Student Fee Dropdown

        [HttpGet]
        [Route("Dropdown")]
        [Authorize(Roles = "Super Admin,Admin,Accountant,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<APIResponse>> GetStudentFeeDropdown()
        {
            try
            {
                _response.Data = await _studentFeeService.GetStudentFeeDropdownAsync();
                _response.Status = true;
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

        #region Update Student Fee

        [HttpPut]
        [Route("UpdateStudentFee/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Accountant")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> UpdateStudentFee(int id, UpdateStudentFeeDTO dto)
        {
            try
            {
                _response.Data = await _studentFeeService.UpdateStudentFeeAsync(id, dto);
                _response.Status = true;
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

        #region Delete Student Fee

        [HttpDelete]
        [Route("DeleteStudentFee/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> DeleteStudentFee(int id)
        {
            try
            {
                _response.Data = await _studentFeeService.DeleteStudentFeeAsync(id);
                _response.Status = true;
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