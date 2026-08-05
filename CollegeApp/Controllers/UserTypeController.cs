using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Model.Models;
using Repository.InterfaceOfRepository;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserTypeController : ControllerBase
    {
        private readonly ICollegeRepository<UserType> _userTypeRepository;
        private readonly IMapper _mapper;
        private readonly APIResponse _response;

        public UserTypeController(
            ICollegeRepository<UserType> userTypeRepository,
            IMapper mapper)
        {
            _userTypeRepository = userTypeRepository;
            _mapper = mapper;
            _response = new APIResponse();
        }

        // Get All User Types
        [HttpGet]
        [Route("All")]
        [Authorize(Roles = "SuperAdmin,Admin")]

        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetAllUserTypes()
        {
            try
            {
                var data = await _userTypeRepository.GetAllAsync();

                _response.Status = true;
                _response.Data = data;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.InternalServerError;

                return _response;
            }
        }

        // Get By Id
        [HttpGet("Id/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]

        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetUserTypeById(int id)
        {
            try
            {
                var data = await _userTypeRepository.GetAsync(x => x.Id == id);

                if (data == null)
                    return NotFound();

                _response.Status = true;
                _response.Data = data;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.InternalServerError;

                return _response;
            }
        }

        // Get By Name
        [HttpGet("Name/{name}")]
        [Authorize(Roles = "SuperAdmin,Admin")]

        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetUserTypeByName(string name)
        {
            try
            {
                var data = await _userTypeRepository.GetAsync(x =>
                    x.Name.ToLower().Contains(name.ToLower()));

                if (data == null)
                    return NotFound();

                _response.Status = true;
                _response.Data = data;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.InternalServerError;

                return _response;
            }
        }


        [HttpGet("Dropdown")]
        [Authorize(Roles = "SuperAdmin,Admin")]


        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetUserTypeDropdown()
        {
            try
            {
                var result = (await _userTypeRepository.GetAllAsync())
                    .Select(x => new DropdownDTO
                    {
                        Id = x.Id,
                        Code = null,
                        Text = x.Name
                    })
                    .ToList();

                _response.Data = result;
                _response.Status = true;
                _response.StatusCode = HttpStatusCode.OK;

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Status = false;
                _response.Errors.Add(ex.Message);
                _response.StatusCode = HttpStatusCode.InternalServerError;

                return _response;
            }
        }

    }


}