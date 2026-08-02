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

        public AcademicYearController(IMapper mapper, ILogger<AcademicYearController> logger,
            IAcademicYearService service, ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();
        }

        [HttpPost("CreateAcademicYear")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> Create(AcademicYearDTO dto)
        {
            try
            {
                _apiResponse.Data = await _service.CreateAcademicYearAsync(dto);
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false; _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }
        }

        [HttpGet("AllAcademicYear")]
        public async Task<ActionResult<APIResponse>> GetAll()
        {
            _apiResponse.Data = await _service.GetAllAcademicYearAsync();
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }

        [HttpGet("Year/{yearName}")]
        public async Task<ActionResult<APIResponse>> Get(string yearName)
        {
            _apiResponse.Data = await _service.GetByYearNameAsync(yearName);
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }

        [HttpPut("UpdateAcademicYear/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> Update(int id, AcademicYearDTO dto)
        {
            _apiResponse.Data = await _service.UpdateAcademicYearAsync(id, dto);
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }

        [HttpDelete("DeleteAcademicYear/{yearName}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> Delete(string yearName)
        {
            _apiResponse.Data = await _service.DeleteAcademicYearAsync(yearName);
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }
    }

}
