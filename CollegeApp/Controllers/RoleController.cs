using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model.Models;
using Repository.InterfaceOfRepository;
using System.Net
;
namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ICollegeRepository<Role> _roleRepository;
        private readonly APIResponse _apiResponse;
        public RoleController(IMapper mapper, ICollegeRepository<Role> roleRepository)
        {
            _mapper = mapper;
            _roleRepository = roleRepository;
            _apiResponse = new APIResponse();
        }

        [HttpPost]
        [Route("Create")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> CreateRoleAsync(RoleDTO dto)
        {
            try
            {

                if (dto == null)
                {
                    return BadRequest();
                }
                var role = _mapper.Map<Role>(dto);
                role.IsDeleted = false;
                role.CreatedDate = DateTime.Now;
                role.ModifyDate = DateTime.Now;


                var result = await _roleRepository.CreateAsync(role);
                dto.Id = result.Id;
                _apiResponse.Data = dto;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = System.Net.HttpStatusCode.Created;

                return Ok(_apiResponse);



            }


            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;

            }


        }


        [HttpGet]
        [Route("All", Name = "GetAllRoles")]

        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error
        public async Task<ActionResult<APIResponse>> GetAsync()
        {
            try
            {
                var result = await _roleRepository.GetAllAsync();
                _apiResponse.Data = _mapper.Map<List<RoleDTO>>(result);
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }


        }


        [HttpGet("id/{Id}", Name = "GetRoleById")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetByIdAsync(int Id)
        {
            try
            {
                if (Id <= 0)
                {
                    return BadRequest();
                }

                var result = await _roleRepository.GetAsync(role => role.Id == Id);
                _apiResponse.Data = _mapper.Map<RoleDTO>(result);
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }
        }

        [HttpGet("Name/{Name}", Name = "GetRoleByName")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetByNameAsync(string Name)
        {
            try
            {
                if (Name == null)
                {
                    return BadRequest();
                }
                var result = await _roleRepository.GetAsync( role => role.RoleName.ToLower().Contains(Name.ToLower()));
                _apiResponse.Data = _mapper.Map<RoleDTO>(result);
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return _apiResponse;
            }



        }



        [HttpGet]
        [Route("dropdown")]
        [Authorize(Roles = "Super Admin,Admin,Operator")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetRoleDropdown()
        {
            try
            {
                var roles = await _roleRepository.GetAllByFilterAsync(x =>
                    x.IsActive && !x.IsDeleted);

                var dropdown = roles
                    .Select(x => new DropdownDTO
                    {
                        Id = x.Id,
                        Code = null,
                        Text = x.RoleName
                    })
                    .OrderBy(x => x.Text)
                    .ToList();

                _apiResponse.Data = dropdown;
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


        [HttpPut]
        [Route("Update")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> UpdateAsync([FromBody] RoleDTO roleDto)
        {
            try
            {
                if(roleDto == null || roleDto.Id <= 0)
                {
                    return BadRequest();
                }
                var role = await _roleRepository.GetAsync(r => r.Id == roleDto.Id,true);
                if (role == null)
                {
                    return NotFound();
                }

                _mapper.Map(roleDto, role);
                role.ModifyDate = DateTime.Now;


                await _roleRepository.UpdateAsync(role);
                _apiResponse.Data = _mapper.Map<RoleDTO>(role);
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return Ok(_apiResponse);
            }
        }




        [HttpDelete("{Id}", Name = "DeleteRoleById")]
        [Authorize(Roles = "Super Admin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> DeleteReleAsync(int Id)
        {
            try
            {
                if (Id <= 0)
                {


                    return BadRequest();
                }
                var role = await _roleRepository.GetAsync(r => r.Id == Id, true);
                if (role == null)
                {
                    return BadRequest($"Enter valid {Id} of Role");
                }
                await _roleRepository.DeleteAsync(role);
                _apiResponse.Data = true;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;
                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.Status = false;
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;
                return Ok(_apiResponse);
            }


        }
    }
}


