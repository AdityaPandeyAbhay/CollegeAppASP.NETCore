using AutoMapper;
using CollegeApp.Models;
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
        private readonly ISubjectService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;


        public SubjectController(
            IMapper mapper,
            ILogger<SubjectController> logger,
            ISubjectService service,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();
        }


        #region Get All Subject

        [HttpGet]
        [Route("GetAllSubject")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<ActionResult<APIResponse>> GetAllSubjectAsync()
        {
            try
            {
                var subjects = await _service.GetAllSubjectAsync();

                _apiResponse.Data = subjects;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }

        #endregion



        #region Get Subject By Code


        [HttpGet]
        [Route("GetSubjectByCode/{code}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<ActionResult<APIResponse>> GetSubjectByCodeAsync(string code)
        {
            try
            {
                var subject = await _service.GetBySubjectCodeAsync(code);


                if (subject == null)
                    return NotFound();


                _apiResponse.Data = subject;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }


        #endregion




        #region Get Subject By Name


        [HttpGet]
        [Route("GetSubjectByName/{name}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]

        public async Task<ActionResult<APIResponse>> GetSubjectByNameAsync(string name)
        {
            try
            {
                var subjects = await _service.GetSubjectByNameAsync(name);


                if (subjects == null)
                    return NotFound();


                _apiResponse.Data = subjects;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);


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
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<ActionResult<APIResponse>> GetDropdownAsync()
        {
            try
            {
                var data = await _service.GetSubjectDropdownAsync();


                _apiResponse.Data = data;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);


                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }


        #endregion




        #region Dropdown By Department


        [HttpGet]
        [Route("DropdownByDepartment/{departmentId:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]

        public async Task<ActionResult<APIResponse>> GetDropdownByDepartmentAsync(int departmentId)
        {
            try
            {
                var data = await _service.GetSubjectDropdownByDepartmentAsync(departmentId);


                _apiResponse.Data = data;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);


                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }


        #endregion




        #region Create Subject


        [HttpPost]
        [Route("CreateSubject")]
        [Authorize(Roles = "Super Admin,Admin")]

        public async Task<ActionResult<APIResponse>> CreateSubjectAsync(CreateSubjectDTO dto)
        {
            try
            {
                if (dto == null)
                    throw new Exception("Invalid Request");


                var subject = await _service.CreateSubjectAsync(dto);


                _apiResponse.Data = subject;
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




        #region Update Subject


        [HttpPut]
        [Route("UpdateSubject/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]


        public async Task<ActionResult<APIResponse>> UpdateSubjectAsync(int id, UpdateSubjectDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);


                var subject = await _service.UpdateSubjectAsync(id, dto);


                _apiResponse.Data = subject;
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




        #region Delete Subject


        [HttpDelete]
        [Route("DeleteSubject/{code}")]
        [Authorize(Roles = "Super Admin,Admin")]


        public async Task<ActionResult<APIResponse>> DeleteSubjectAsync(string code)
        {
            try
            {
                await _service.DeleteSubjectAsync(code);


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