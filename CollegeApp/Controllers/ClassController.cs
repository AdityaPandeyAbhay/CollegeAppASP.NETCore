using AutoMapper;
using CollegeApp.Models;
using CollegeApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Class_Model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClassController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<ClassController> _logger;
        private readonly IClassService _classService;
        private readonly APIResponse _response;
        private readonly ICurrentUserServices _currentUserService;

        public ClassController(
            IMapper mapper,
            ILogger<ClassController> logger,
            IClassService classService,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _classService = classService;
            _currentUserService = currentUserService;
            _response = new APIResponse();
        }

        #region Get All Classes

        [HttpGet]
        [Route("GetAllClass")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAllClass()
        {
            try
            {
                var data = await _classService.GetAllClassAsync();

                _response.Data = data;
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

        #region Get Class By Code

        [HttpGet]
        [Route("GetClassByCode/{code}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetClassByCode(string code)
        {
            try
            {
                var data = await _classService.GetByClassCodeAsync(code);

                _response.Data = data;
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

        #region Get Class By Name

        [HttpGet]
        [Route("GetClassByName/{name}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetClassByName(string name)
        {
            try
            {
                var data = await _classService.GetClassByNameAsync(name);

                _response.Data = data;
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

        #region Create Class

        [HttpPost]
        [Route("CreateClass")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateClass(SchoolClassDTO dto)
        {
            try
            {
                var data = await _classService.CreateClassAsync(dto);

                _response.Data = data;
                _response.Status = true;
                _response.StatusCode = HttpStatusCode.Created;

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


        #region Class Dropdown

        [HttpGet]
        [Route("Dropdown")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<APIResponse>> GetDropdown()
        {
            try
            {
                _response.Data = await _classService.GetClassDropdownAsync();
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

        #region Update Class

        [HttpPut]
        [Route("UpdateClass/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> UpdateClass(int id, SchoolClassDTO dto)
        {
            try
            {
                var data = await _classService.UpdateClassAsync(id, dto);

                _response.Data = data;
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

        #region Delete Class

        [HttpDelete]
        [Route("DeleteClass/{code}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> DeleteClass(string code)
        {
            try
            {
                var data = await _classService.DeleteClassAsync(code);

                _response.Data = data;
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