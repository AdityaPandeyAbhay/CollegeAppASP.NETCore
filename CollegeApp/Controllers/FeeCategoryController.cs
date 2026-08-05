
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
    public class FeeCategoryController : ControllerBase
    {
        private readonly IFeeCategoryService _feeCategoryService;
        private readonly ILogger<FeeCategoryController> _logger;
        private readonly APIResponse _response;

        public FeeCategoryController(
            IFeeCategoryService feeCategoryService,
            ILogger<FeeCategoryController> logger)
        {
            _feeCategoryService = feeCategoryService;
            _logger = logger;
            _response = new APIResponse();
        }

        #region Get All

        [HttpGet]
        [Route("GetAllFeeCategory")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<APIResponse>> GetAllFeeCategory()
        {
            try
            {
                _response.Data = await _feeCategoryService.GetAllFeeCategoryAsync();
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

                return StatusCode(500, _response);
            }
        }

        #endregion

        #region Get By Id

        [HttpGet]
        [Route("GetFeeCategoryById/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        public async Task<ActionResult<APIResponse>> GetFeeCategoryById(int id)
        {
            try
            {
                _response.Data = await _feeCategoryService.GetFeeCategoryByIdAsync(id);
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

        #region Get By Name

        [HttpGet]
        [Route("GetFeeCategoryByName/{name}")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        public async Task<ActionResult<APIResponse>> GetFeeCategoryByName(string name)
        {
            try
            {
                _response.Data = await _feeCategoryService.GetFeeCategoryByNameAsync(name);
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

        #region Create

        [HttpPost]
        [Route("CreateFeeCategory")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> CreateFeeCategory(FeeCategoryDTO dto)
        {
            try
            {
                _response.Data = await _feeCategoryService.CreateFeeCategoryAsync(dto);
                _response.Status = true;
                _response.StatusCode = HttpStatusCode.Created;

                return StatusCode(201, _response);
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


        [HttpGet("Dropdown")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetFeeCategoryDropdown()
        {
            try
            {
                var result = await _feeCategoryService.GetFeeCategoryDropdownAsync();

                if (result == null || !result.Any())
                {
                    return NotFound();
                }

                _response.Data = result;
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

        #region Update

        [HttpPut]
        [Route("UpdateFeeCategory/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> UpdateFeeCategory(int id, FeeCategoryDTO dto)
        {
            try
            {
                _response.Data = await _feeCategoryService.UpdateFeeCategoryAsync(id, dto);
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

        #region Delete

        [HttpDelete]
        [Route("DeleteFeeCategory/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> DeleteFeeCategory(int id)
        {
            try
            {
                _response.Data = await _feeCategoryService.DeleteFeeCategoryAsync(id);
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