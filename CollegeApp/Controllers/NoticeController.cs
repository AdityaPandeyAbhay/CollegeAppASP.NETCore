using AutoMapper;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Department_model;
using Model.Models.Notice_Model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NoticeController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ILogger<NoticeController> _logger;
        private readonly INoticeService _service;
        private readonly APIResponse _apiResponse;
        private readonly ICurrentUserServices _currentUserService;
        public NoticeController(IMapper mapper,
            ILogger<NoticeController> logger,
            INoticeService service,
            ICurrentUserServices currentUserService)
        {
            _mapper = mapper;
            _logger = logger;
            _service = service;
            _currentUserService = currentUserService;
            _apiResponse = new APIResponse();

        }


        [HttpPost]
        [Route("CreateNotice")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]

        public async Task<ActionResult<APIResponse>> CreateNoticeAsync(CreateNoticeDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    throw new Exception("Invalid request.");
                }
                var notice = await _service.CreateNoticeAsync(dto);
                _apiResponse.Data = notice;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating notice.");
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors = new List<string> { ex.Message };
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }



        [HttpGet("GetNonPublished")]

        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonPublished()
        {
            try
            {
                var notices = await _service.GetNonPublishedAsync();
                _apiResponse.Data = notices;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching non-published notices.");
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors = new List<string> { ex.Message };
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }




        [HttpGet("GetNonPublishedById/{id}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonPublishedById(int id)
        {
            try
            {
                var notice = await _service.GetNonPublishedByIdAsync(id);

                _apiResponse.Data = notice;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                _apiResponse.Errors = new List<string>();

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error occurred while fetching non-published notice {Id}.",
                    id);

                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Data = null;
                _apiResponse.Errors = new List<string> { ex.Message };

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    _apiResponse);
            }
        }



        [HttpPut("Publish/{id}")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> Publish(int id)
        {
            try
            {
                
                var notice = await _service.PublishNoticeAsync(id);
                _apiResponse.Data = notice;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while publishing notice.");
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors = new List<string> { ex.Message };
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }



        [HttpGet("GetAllPublished")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetAllPublished()
        {
            try
            {
                var notices = await _service.GetAllPublishedAsync();
                _apiResponse.Data = notices;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching all published notices.");
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors = new List<string> { ex.Message };
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }



        [HttpGet("GetNonPublishedDropdown")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetNonPublishedDropdown()
        {
            try
            {
                var notices = await _service.GetNonPublishedDropdownAsync();
                _apiResponse.Data = notices;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching non-published notices for dropdown.");
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                _apiResponse.Errors = new List<string> { ex.Message };
                return StatusCode(StatusCodes.Status500InternalServerError, _apiResponse);
            }
        }
    }
}
