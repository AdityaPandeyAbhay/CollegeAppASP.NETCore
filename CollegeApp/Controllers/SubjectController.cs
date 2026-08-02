using AutoMapper;
using CollegeApp.Models;
using CollegeApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Subject_model;

using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubjectController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<SubjectController> _logger;
        private readonly ISubjectService _subjectService;
        private readonly APIResponse _response;
        private readonly ICurrentUserServices _currentUserService;

        public SubjectController(
            IMapper mapper,
            ILogger<SubjectController> logger,
            ISubjectService subjectService,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _subjectService = subjectService;
            _currentUserService = currentUserService;
            _response = new APIResponse();
        }

        #region Get All Subjects

        [HttpGet]
        [Route("GetAllSubject")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAllSubject()
        {
            try
            {
                var data = await _subjectService.GetAllSubjectAsync();

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

        #region Get Subject By Code

        [HttpGet]
        [Route("GetSubjectByCode/{code}")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetSubjectByCode(string code)
        {
            try
            {
                var data = await _subjectService.GetBySubjectCodeAsync(code);

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

        #region Get Subject By Name

        [HttpGet]
        [Route("GetSubjectByName/{name}")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetSubjectByName(string name)
        {
            try
            {
                var data = await _subjectService.GetSubjectByNameAsync(name);

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

        #region Create Subject

        [HttpPost]
        [Route("CreateSubject")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateSubject(CreateSubjectDTO dto)
        {
            try
            {
                var data = await _subjectService.CreateSubjectAsync(dto);

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

        #region Update Subject

        [HttpPut]
        [Route("UpdateSubject/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> UpdateSubject(int id, UpdateSubjectDTO dto)
        {
            try
            {
                var data = await _subjectService.UpdateSubjectAsync(id, dto);

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

        #region Delete Subject

        [HttpDelete]
        [Route("DeleteSubject/{code}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> DeleteSubject(string code)
        {
            try
            {
                var data = await _subjectService.DeleteSubjectAsync(code);

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