using AutoMapper;
using CollegeApp.Models;
using CollegeApp.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IMapper _mapper;
        private readonly IUserService _userService;
        private readonly APIResponse _apiResponse;


        public UserController(
            ILogger<UserController> logger,
            IMapper mapper,
            IUserService userService)
        {
            _logger = logger;
            _mapper = mapper;
            _userService = userService;
            _apiResponse = new();
        }



        // ===============================
        // CREATE USER
        // Only SuperAdmin and Admin
        // ===============================

        [HttpPost]
        [Route("CreateUser")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> CreateUserAsync(UserDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest();


                var userCreated = await _userService.CreateUserAsync(dto);


                _apiResponse.Data = userCreated;
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





        // ===============================
        // GET ALL USERS
        // Only Admin/SuperAdmin
        // ===============================

        [HttpGet]
        [Route("All")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetAllUserAsync()
        {
            try
            {
                var users = await _userService.GetUser();


                _apiResponse.Data = users;
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





        // ===============================
        // GET USER BY ID
        // ===============================

        [HttpGet("id/{Id}")]

        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetUserByIdAsync(string Id)
        {
            try
            {
                var currentUserId = User.FindFirst("UserId")?.Value;

                var role = User.FindFirst(ClaimTypes.Role)?.Value;


                // Admin can view anyone
                if (role != "SuperAdmin" && role != "Admin")
                {
                    // User can view only himself
                    if (currentUserId != Id)
                    {
                        return Forbid();
                    }
                }



                var user = await _userService.GetUserByIdAsync(Id);


                if (user == null)
                    return NotFound();



                _apiResponse.Data = user;
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





        // ===============================
        // GET USER BY NAME
        // ===============================

        [HttpGet("Name/{Name}")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetUserByNameAsync(string Name)
        {
            try
            {
                var currentUsername = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                if (role != "SuperAdmin" && role != "Admin")
                {
                    if (!string.Equals(currentUsername, Name, StringComparison.OrdinalIgnoreCase))
                    {
                        return Forbid();
                    }
                }

                var user = await _userService.GetUserByNameAsync(Name);


                if (user == null)
                    return NotFound();



                _apiResponse.Data = user;
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



        [HttpGet]
        [Route("dropdown")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error


        public async Task<ActionResult<APIResponse>> GetUserDropdown()
        {
            try
            {

                var users =
                    await _userService.GetUserDropdownAsync();


                _apiResponse.Status = true;
                _apiResponse.Data = users;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }




        // ===============================
        // UPDATE USER
        //
        // Admin/SuperAdmin -> Anyone
        // Other users -> Only Self
        //
        // ===============================

        [HttpPut]
        [Route("UpdateUser")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> UpdateUserAsync(UserDTO dto)
        {
            try
            {
                if (dto == null || dto.Id == null)
                    return BadRequest();



                string? currentUserId =
                    User.FindFirst("UserId")?.Value;


                string? role =
                    User.FindFirst(ClaimTypes.Role)?.Value;



                // Normal user
                if (role != "SuperAdmin" &&
                   role != "Admin")
                {

                    if (currentUserId != dto.Id.ToString())
                    {
                        return Forbid();
                    }

                }



                var result =
                    await _userService.UpdateUserAsync(dto);



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }







        // ===============================
        // DELETE USER
        //
        // Admin/SuperAdmin -> Anyone
        // Other users -> Only Self
        //
        // ===============================

        [HttpDelete("{Id}")] 
         [ProducesResponseType(StatusCodes.Status200OK)]          // Success

        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created

        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request

        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed

        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied

        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> DeleteUserAsync(string Id)
        {
            try
            {

                string? currentUserId =
                    User.FindFirst("UserId")?.Value;


                string? role =
                    User.FindFirst(ClaimTypes.Role)?.Value;



                if (role != "SuperAdmin" &&
                   role != "Admin")
                {

                    if (currentUserId != Id)
                    {
                        return Forbid();
                    }

                }



                await _userService.DeleteUserAsync(Id);



                _apiResponse.Data = true;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }
    }
}