using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Model.Models;
using Repository.InterfaceOfRepository;
using System.Net;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RolePrivilegeController : ControllerBase
    {
       
        private readonly IMapper _mapper;
        private readonly ICollegeRepository<RolePrivilege> _rolePrivilegeRepository;
        private readonly APIResponse _apiResponse;

    
        public RolePrivilegeController( IMapper mapper, ICollegeRepository<RolePrivilege> rolePrivilegeRepository )
        {
            _apiResponse = new APIResponse();
            _mapper = mapper;
            _rolePrivilegeRepository = rolePrivilegeRepository;

        }


        [HttpPost]
        [Route("CreateRolePrivilege")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status201Created)]     // Resource Created
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> CreateRolePrivilegeAsync(RolePrivilegeDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest();

                var result =  _mapper.Map<RolePrivilege>(dto);
                result.IsDeleted = false;
                result.CreatedDate = DateTime.Now;
                result.ModifyDate = DateTime.Now;

                _apiResponse.Data = await _rolePrivilegeRepository.CreateAsync(result);
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;
                return(_apiResponse);

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
        [Route("All", Name = "GetAllRolePrivileges")]

        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error
        public async Task<ActionResult<APIResponse>> GetRolePrivilegeAsync()
        {
            try
            {
                var result = await _rolePrivilegeRepository.GetAllAsync();
                _apiResponse.Data = result;
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









        [HttpGet("Roleid/{RoleId}", Name = "GetRolePrivilegeById")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetRolePrivilegeByIdAsync(int RoleId)
        {
            try
            {
                if (RoleId <= 0)
                {
                    return BadRequest();
                }
                var result = await _rolePrivilegeRepository.GetAllByFilterAsync(n => n.RoleId == RoleId, true);
                if (result == null || !result.Any())
                {
                    return NotFound();
                }
                _apiResponse.Data = result;
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







        [HttpGet("Name/{Name}", Name = "GetRolePrivilegeByName")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> GetRolePrivilegeByNameAsync(string Name)
        {
            try
            {
                if (string.IsNullOrEmpty(Name))
                {
                    return BadRequest();
                }
                var result = await _rolePrivilegeRepository.GetAllByFilterAsync(n => n.RolePrivilegeName.ToLower().Contains(Name.ToLower()));
                if (result == null||!result.Any())
                {
                    return NotFound();
                }
                _apiResponse.Data = result;
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





        [HttpGet("Dropdown")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<APIResponse>> GetRolePrivilegeDropdown()
        {
            try
            {
                var result = (await _rolePrivilegeRepository.GetAllAsync())
                    .Where(x => x.IsActive && !x.IsDeleted)
                    .Select(x => new DropdownDTO
                    {
                        Id = x.Id,
                        Code = null,
                        Text = x.RolePrivilegeName
                    })
                    .OrderBy(x => x.Text)
                    .ToList();

                if (!result.Any())
                {
                    return NotFound();
                }

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



        [HttpPut]
        [Route("UpdateRolePrivilege")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> UpdateRolePrivilegeAsync([FromBody] RolePrivilegeDTO dto)
        {
            try
            {
                if (dto == null || dto.Id <= 0)
                {
                    return BadRequest();
                }
                var rolePrivilege = await _rolePrivilegeRepository.GetAsync(r => r.Id == dto.Id, true);
                if (rolePrivilege == null)
                {
                    return NotFound();
                }
                _mapper.Map(dto, rolePrivilege);
                rolePrivilege.ModifyDate = DateTime.Now;



                _apiResponse.Data = await _rolePrivilegeRepository.UpdateAsync(rolePrivilege);
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







        [HttpDelete("{Id}", Name = "DeleteRolePrivilegeById")]
        [ProducesResponseType(StatusCodes.Status200OK)]          // Success
        [ProducesResponseType(StatusCodes.Status400BadRequest)]  // Invalid Request
        [ProducesResponseType(StatusCodes.Status401Unauthorized)] // Authentication Failed
        [ProducesResponseType(StatusCodes.Status403Forbidden)]   // Access Denied
        [ProducesResponseType(StatusCodes.Status500InternalServerError)] // Server Error

        public async Task<ActionResult<APIResponse>> DeleteRolePrivilegeAsync(int Id)
        {
            try
            {
                if (Id <= 0)
                {
                    return BadRequest();
                }
                var rolePrivilege = await _rolePrivilegeRepository.GetAsync(r => r.Id == Id, true);
                if (rolePrivilege == null)
                {
                    return NotFound();
                }
                await _rolePrivilegeRepository.DeleteAsync(rolePrivilege);
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
                return _apiResponse;
            }


        }

    }
}
