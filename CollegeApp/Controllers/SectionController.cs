using AutoMapper;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Class_Model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SectionController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<SectionController> _logger;
        private readonly ISectionService _sectionService;
        private readonly APIResponse _response;
        private readonly ICurrentUserServices _currentUserService;

        public SectionController(
            IMapper mapper,
            ILogger<SectionController> logger,
            ISectionService sectionService,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _sectionService = sectionService;
            _currentUserService = currentUserService;
            _response = new APIResponse();
        }

        #region Get All Sections

        [HttpGet]
        [Route("GetAllSection")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAllSection()
        {
            try
            {
                var data = await _sectionService.GetAllSectionAsync();

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

        #region Get Section By Code

        [HttpGet]
        [Route("GetSectionByCode/{code}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetSectionByCode(string code)
        {
            try
            {
                var data = await _sectionService.GetBySectionCodeAsync(code);

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

        #region Get Section By Name

        [HttpGet]
        [Route("GetSectionByName/{name}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> GetSectionByName(string name)
        {
            try
            {
                var data = await _sectionService.GetSectionByNameAsync(name);

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

        #region Section Dropdown

        [HttpGet]
        [Route("Dropdown")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetDropdown()
        {
            try
            {
                _response.Data = await _sectionService.GetSectionDropdownAsync();
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

        #region Create Section

        [HttpPost]
        [Route("CreateSection")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> CreateSection(CreateSectionDTO dto)
        {
            try
            {
                var data = await _sectionService.CreateSectionAsync(dto);

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

        #region Update Section

        [HttpPut]
        [Route("UpdateSection/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<APIResponse>> UpdateSection(int id, UpdateSectionDTO dto)
        {
            try
            {
                var data = await _sectionService.UpdateSectionAsync(id, dto);

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

        #region Delete Section

        [HttpDelete]
        [Route("DeleteSection/{code}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<APIResponse>> DeleteSection(string code)
        {
            try
            {
                var data = await _sectionService.DeleteSectionAsync(code);

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

