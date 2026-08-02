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
    public class FeeStructureController : ControllerBase
    {
        private readonly IFeeStructureService _feeStructureService;
        private readonly ILogger<FeeStructureController> _logger;
        private readonly APIResponse _response;

        public FeeStructureController(
            IFeeStructureService feeStructureService,
            ILogger<FeeStructureController> logger)
        {
            _feeStructureService = feeStructureService;
            _logger = logger;
            _response = new APIResponse();
        }

        #region Get All Fee Structures

        [HttpGet]
        [Route("GetAllFeeStructures")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<APIResponse>> GetAllFeeStructures()
        {
            try
            {
                _response.Data = await _feeStructureService.GetAllFeeStructureAsync();
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

        #region Get Fee Structure By Id

        [HttpGet]
        [Route("GetFeeStructureById/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        public async Task<ActionResult<APIResponse>> GetFeeStructureById(int id)
        {
            try
            {
                _response.Data = await _feeStructureService.GetFeeStructureByIdAsync(id);
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

        #region Get Fee Structure By Category

        [HttpGet]
        [Route("GetFeeStructureByCategory/{feeCategoryId:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        public async Task<ActionResult<APIResponse>> GetFeeStructureByCategory(int feeCategoryId)
        {
            try
            {
                _response.Data = await _feeStructureService.GetFeeStructureByCategoryAsync(feeCategoryId);
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

        #region Get Fee Structure By Class

        [HttpGet]
        [Route("GetFeeStructureByClass/{classId:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Accountant")]
        public async Task<ActionResult<APIResponse>> GetFeeStructureByClass(int classId)
        {
            try
            {
                _response.Data = await _feeStructureService.GetFeeStructureByClassAsync(classId);
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

        #region Create Fee Structure

        [HttpPost]
        [Route("CreateFeeStructure")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> CreateFeeStructure(CreateFeeStructureDTO dto)
        {
            try
            {
                _response.Data = await _feeStructureService.CreateFeeStructureAsync(dto);
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

        #region Update Fee Structure

        [HttpPut]
        [Route("UpdateFeeStructure/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> UpdateFeeStructure(int id, UpdateFeeStructureDTO dto)
        {
            try
            {
                _response.Data = await _feeStructureService.UpdateFeeStructureAsync(id, dto);
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

        #region Delete Fee Structure

        [HttpDelete]
        [Route("DeleteFeeStructure/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> DeleteFeeStructure(int id)
        {
            try
            {
                _response.Data = await _feeStructureService.DeleteFeeStructureAsync(id);
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
