using AutoMapper;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model.Models;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AcademicYearController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<AcademicYearController> _logger;
        private readonly IAcademicYearService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;

        public AcademicYearController(
            IMapper mapper,
            ILogger<AcademicYearController> logger,
            IAcademicYearService service,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();
        }

        #region Create Academic Year

        [HttpPost]
        [Route("CreateAcademicYear")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> CreateAcademicYearAsync(AcademicYearDTO dto)
        {
            try
            {
                if (dto == null)
                    throw new Exception("Invalid request.");

                var result = await _service.CreateAcademicYearAsync(dto);

                _apiResponse.Data = result;
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

        #endregion

        #region Get All Academic Years

        [HttpGet]
        [Route("AllAcademicYear")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAllAcademicYearAsync()
        {
            try
            {
                var result = await _service.GetAllAcademicYearAsync();

                _apiResponse.Data = result;
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

        #endregion

        #region Dropdown

        [HttpGet]
        [Route("Dropdown")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetDropdownAsync()
        {
            try
            {
                var result = await _service.GetDropdownAsync();

                _apiResponse.Data = result;
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

        #endregion

        #region Get By Year Name

        [HttpGet("Year/{yearName}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAcademicYearByNameAsync(string yearName)
        {
            try
            {
                var result = await _service.GetByYearNameAsync(yearName);

                if (result == null)
                    return NotFound();

                _apiResponse.Data = result;
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

        #endregion

        #region Update Academic Year

        [HttpPut]
        [Route("UpdateAcademicYear/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> UpdateAcademicYearAsync(int id, AcademicYearDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _service.UpdateAcademicYearAsync(id, dto);

                _apiResponse.Data = result;
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

        #endregion

        #region Delete Academic Year

        [HttpDelete]
        [Route("DeleteAcademicYear/{yearName}")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> DeleteAcademicYearAsync(string yearName)
        {
            try
            {
                await _service.DeleteAcademicYearAsync(yearName);

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

                return _apiResponse;
            }
        }

        #endregion
    }
}