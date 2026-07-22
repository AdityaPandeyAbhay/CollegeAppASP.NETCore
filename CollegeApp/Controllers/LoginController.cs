using CollegeApp.Models;
using Repository.InterfaceOfRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;



namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   
    [Authorize]
    public class LoginController : ControllerBase
    {
        public readonly IConfiguration _configuration;
        public readonly IUserRepository _userRepository;
        public LoginController(IConfiguration configuration,IUserRepository userRepository)
        {
            _configuration = configuration;
            _userRepository = userRepository;
        }

        [AllowAnonymous]
        [HttpPost]
        public async Task<ActionResult> Login(LoginDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest("Plese provide valid login credentials.");

            }
            LoginResponseDTO response = new LoginResponseDTO() { Username = dto.Username};

            var user = await _userRepository.GetUserForLoginAsync(dto.Username);

            if (user != null)
            {

                byte[] salt = Convert.FromBase64String(user.PasswordSalt);

                string hash = Convert.ToBase64String(
                    Rfc2898DeriveBytes.Pbkdf2(
                        dto.Password,
                        salt,
                        100000,
                        HashAlgorithmName.SHA256,
                        32));

                bool isValid = hash == user.Password;




                if (isValid==true)
                {
                    var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]!);
                    var tokenHandler = new JwtSecurityTokenHandler();

                    if (user.UserType == null)
                    {
                        return BadRequest("UserType is NULL");
                    }

                    if (user.UserRoleMappings == null)
                    {
                        return BadRequest("UserRoleMappings is NULL");
                    }

                    List<Claim> claims1 = new() 
                    {
                     new Claim(ClaimTypes.Name, user.Username),
                     new Claim("UserId", user.Id.ToString()),
                      new Claim("UserType", user.UserType.Name)
                     };

                    var claims = claims1;

                    foreach (var mapping in user.UserRoleMappings)
                    {
                        if (mapping.Role == null)
                        {
                            return BadRequest("Role is NULL");
                        }

                        claims.Add(new Claim(ClaimTypes.Role, mapping.Role.RoleName));
                    }


                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(claims),

                        Issuer = _configuration["JwtSettings:Issuer"],
                        Audience = _configuration["JwtSettings:Audience"],
                        Expires = DateTime.UtcNow.AddMinutes(60),
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    response.Token = tokenHandler.WriteToken(token);
                }
                else
                {
                    return BadRequest(new
                    {
                        message = "Invalid username or password."
                    });
                }
            }
            else
            {
                return BadRequest(new
                {
                    message = "Invalid username or password."
                });
            }
            return Ok(response);
        }



    }
}

