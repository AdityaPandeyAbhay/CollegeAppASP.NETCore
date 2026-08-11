using CollegeApp.Data;
using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using Repository.InterfaceOfRepository;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static System.Net.Mime.MediaTypeNames;

namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LoginController : ControllerBase
    {
        public readonly IConfiguration _configuration;
        public readonly IUserRepository _userRepository;

        public LoginController(
            IConfiguration configuration,
            IUserRepository userRepository)
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
                return BadRequest("Please provide valid login credentials.");
            }

            LoginResponseDTO response = new LoginResponseDTO()
            {
                Username = dto.Username
            };

            var user = await _userRepository.GetUserForLoginAsync(dto.Username);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Invalid username or password."
                });
            }

            // Password verification
            byte[] salt = Convert.FromBase64String(user.PasswordSalt);

            string hash = Convert.ToBase64String(
                Rfc2898DeriveBytes.Pbkdf2(
                    dto.Password,
                    salt,
                    100000,
                    HashAlgorithmName.SHA256,
                    32));

            bool isValid = hash == user.Password;

            if (!isValid)
            {
                return BadRequest(new
                {
                    message = "Invalid username or password."
                });
            }

            // JWT configuration
            var key = Encoding.UTF8.GetBytes(
                _configuration["JwtSettings:Key"]!);

            var tokenHandler = new JwtSecurityTokenHandler();

            // Validate UserType
            if (user.UserType == null)
            {
                return BadRequest("UserType is NULL");
            }

            // Validate UserRoleMappings
            if (user.UserRoleMappings == null)
            {
                return BadRequest("UserRoleMappings is NULL");
            }

            // JWT Claims
            List<Claim> claims = new()
            {
                // Existing claim - keep it for your current User module
                new Claim("UserId", user.Id.ToString()),

                // Standard claim - used by CurrentUserServices
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                // Username
                new Claim(
                    ClaimTypes.Name,
                    user.Username),

                // User Type
                new Claim(
                    "UserType",
                    user.UserType.Name)
            };

            // Add roles
            foreach (var mapping in user.UserRoleMappings)
            {
                if (mapping.Role == null)
                {
                    return BadRequest("Role is NULL");
                }

                claims.Add(
                    new Claim(
                        ClaimTypes.Role,
                        mapping.Role.RoleName));
            }

            // JWT Token Descriptor
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),

                Issuer = _configuration["JwtSettings:Issuer"],

                Audience = _configuration["JwtSettings:Audience"],

                Expires = DateTime.UtcNow.AddMinutes(60),

                SigningCredentials =
                    new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
            };

            // Create Token
            var token = tokenHandler.CreateToken(tokenDescriptor);

            // Write Token
            response.Token = tokenHandler.WriteToken(token);

            return Ok(response);
        }
    }
}
