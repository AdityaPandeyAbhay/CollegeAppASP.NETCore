using AutoMapper;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Department_model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DepartmentController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<DepartmentController> _logger;
        private readonly IDepartmentService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;

        public DepartmentController(IMapper mapper,
            ILogger<DepartmentController> logger,
            IDepartmentService service,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();
        }

        [HttpPost("CreateDepartment")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> CreateDepartment(CreateDepartmentDTO dto)
        {
            try
            {
                _apiResponse.Data = await _service.CreateDepartmentAsync(dto);
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

        [HttpGet("AllDepartment")]
        public async Task<ActionResult<APIResponse>> GetAllDepartment()
        {
            _apiResponse.Data = await _service.GetAllDepartmentAsync();
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }

        [HttpGet("DepartmentCode/{code}")]
        public async Task<ActionResult<APIResponse>> GetByCode(string code)
        {
            _apiResponse.Data = await _service.GetByDepartmentCodeAsync(code);
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }

        [HttpGet("Name/{name}")]
        public async Task<ActionResult<APIResponse>> GetByName(string name)
        {
            _apiResponse.Data = await _service.GetDepartmentByNameAsync(name);
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }

        [HttpPut("UpdateDepartment/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> Update(int id, UpdateDepartmentDTO dto)
        {
            _apiResponse.Data = await _service.UpdateDepartmentAsync(id, dto);
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }

        [HttpDelete("DeleteDepartment/{code}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> Delete(string code)
        {
            _apiResponse.Data = await _service.DeleteDepartmentAsync(code);
            _apiResponse.Status = true;
            _apiResponse.StatusCode = HttpStatusCode.OK;
            return Ok(_apiResponse);
        }
    }
}
