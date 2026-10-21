using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Model.Models;
using Repository.InterfaceOfRepository;
using System.Data.SqlTypes;
using System.Security.Cryptography;

namespace CollegeApp.Services
{
    public class UserService:IUserService
    {   
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly ICollegeRepository<UserRoleMapping> _userRoleRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public UserService(IUserRepository userRepository,IMapper mapper, ICollegeRepository<UserRoleMapping> userRoleRepository, IHttpContextAccessor httpContextAccessor)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _userRoleRepository = userRoleRepository;
            _httpContextAccessor = httpContextAccessor;
        }


       
       
        public async Task<bool> CreateUserAsync(UserDTO userDTO)
        {
            ArgumentNullException.ThrowIfNull(
                userDTO,
                $"The argument {nameof(userDTO)} is null"
            );

            // =====================================================
            // 1. VALIDATE USER ID
            // =====================================================

            if (string.IsNullOrWhiteSpace(userDTO.Id))
            {
                throw new ArgumentException(
                    "User Id is required."
                );
            }

            // =====================================================
            // 2. VALIDATE USERNAME
            // =====================================================

            if (string.IsNullOrWhiteSpace(userDTO.Username))
            {
                throw new ArgumentException(
                    "Username is required."
                );
            }

            // =====================================================
            // 3. VALIDATE PASSWORD
            // =====================================================

            if (string.IsNullOrWhiteSpace(userDTO.Password))
            {
                throw new ArgumentException(
                    "Password cannot be null or empty."
                );
            }

            // =====================================================
            // 4. VALIDATE USER TYPE
            //
            // 1 = Super Admin
            // 2 = Admin
            // 3 = Teacher
            // 4 = Non Teaching Staff
            // 5 = Student
            // =====================================================

            if (userDTO.UserTypeId < 1 || userDTO.UserTypeId > 5)
            {
                throw new ArgumentException(
                    "Invalid UserTypeId. Valid values are 1 to 5."
                );
            }

            // =====================================================
            // 5. CHECK WHETHER THIS IS THE FIRST USER
            // =====================================================

            var existingUsers = await _userRepository.GetAllAsync();

            bool isFirstUser = existingUsers.Count == 0;

            // =====================================================
            // 6. FIRST USER = SUPER ADMIN ONLY
            // =====================================================

            if (isFirstUser)
            {
                if (userDTO.UserTypeId != 1)
                {
                    throw new UnauthorizedAccessException(
                        "The first user must be a Super Admin."
                    );
                }

                // Super Admin Role = 1
                if (userDTO.RoleIds == null ||
                    !userDTO.RoleIds.Contains(1))
                {
                    throw new ArgumentException(
                        "The first Super Admin must have Super Admin role."
                    );
                }
            }
            else
            {
                // =================================================
                // 7. AFTER FIRST USER, JWT AUTHENTICATION REQUIRED
                // =================================================

                var currentUserId =
                    _httpContextAccessor.HttpContext?
                        .User
                        .FindFirst("UserId")?
                        .Value
                    ?? _httpContextAccessor.HttpContext?
                        .User
                        .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?
                        .Value
                    ?? _httpContextAccessor.HttpContext?
                        .User
                        .FindFirst("nameid")?
                        .Value
                    ?? _httpContextAccessor.HttpContext?
                        .User
                        .FindFirst(System.Security.Claims.ClaimTypes.Name)?
                        .Value;

                if (string.IsNullOrWhiteSpace(currentUserId))
                {
                    throw new UnauthorizedAccessException(
                        "User is not authenticated."
                    );
                }

                // =================================================
                // 8. GET CURRENT LOGGED-IN USER
                // =================================================

                var currentUser = await _userRepository.GetAsync(
                    u => u.Id.ToLower() == currentUserId.ToLower() || (u.Username != null && u.Username.ToLower() == currentUserId.ToLower())
                );

                if (currentUser == null)
                {
                    throw new UnauthorizedAccessException(
                        "Logged-in user not found."
                    );
                }

                // =================================================
                // 9. CURRENT USER MUST BE ACTIVE
                // =================================================

                if (!currentUser.IsActive || currentUser.IsDeleted)
                {
                    throw new UnauthorizedAccessException(
                        "Logged-in user is inactive or deleted."
                    );
                }

                var userRoles = await _userRoleRepository.GetAllByFilterAsync(
                    m => m.UserId.ToLower() == currentUser.Id.ToLower()
                );
                var userRoleIds = userRoles?.Select(m => m.RoleId).Distinct().ToList() ?? new List<int>();

                bool isSuperAdmin = currentUser.UserTypeId == 1 || userRoleIds.Contains(1) || (_httpContextAccessor.HttpContext?.User.IsInRole("Super Admin") ?? false);
                bool isAdmin = currentUser.UserTypeId == 2 || userRoleIds.Contains(2) || (_httpContextAccessor.HttpContext?.User.IsInRole("Admin") ?? false);
                bool isOperator = currentUser.UserTypeId == 4 || userRoleIds.Contains(6) || (_httpContextAccessor.HttpContext?.User.IsInRole("Operator") ?? false);

                // =================================================
                // 10. PREVENT CREATION OF ANOTHER SUPER ADMIN
                // =================================================

                if (userDTO.UserTypeId == 1 || (userDTO.RoleIds != null && userDTO.RoleIds.Contains(1)))
                {
                    throw new UnauthorizedAccessException(
                        "Another Super Admin cannot be created."
                    );
                }

                // =================================================
                // 11. ADMIN CAN ONLY BE CREATED BY SUPER ADMIN
                // =================================================

                if (userDTO.UserTypeId == 2 || (userDTO.RoleIds != null && userDTO.RoleIds.Contains(2)))
                {
                    if (!isSuperAdmin)
                    {
                        throw new UnauthorizedAccessException(
                            "Only Super Admin can create an Admin user."
                        );
                    }

                    // Admin Role = 2
                    if (userDTO.RoleIds == null ||
                        !userDTO.RoleIds.Contains(2))
                    {
                        throw new ArgumentException(
                            "Admin user must have Admin role."
                        );
                    }
                }

                // =================================================
                // 12. OPERATOR ROLE RESTRICTIONS
                // Operator can only create Office Staff (7) and Other Non Teaching Staff (4), Teacher (3), Student (5)
                // Operator cannot create Operator (6), Admin (2), or Super Admin (1)
                // =================================================

                if (isOperator && !isSuperAdmin && !isAdmin)
                {
                    if (userDTO.RoleIds != null && userDTO.RoleIds.Contains(4))
                    {
                        throw new UnauthorizedAccessException(
                            "Operators cannot create other Operator accounts. Only Office Staff and Other Non Teaching Staff can be created."
                        );
                    }

                    if (userDTO.UserTypeId == 1 || userDTO.UserTypeId == 2 || (userDTO.RoleIds != null && (userDTO.RoleIds.Contains(1) || userDTO.RoleIds.Contains(2))))
                    {
                        throw new UnauthorizedAccessException(
                            "Operators cannot create Admin or Super Admin accounts."
                        );
                    }
                }

                // =================================================
                // 13. AUTHORIZATION CHECK: ONLY SUPER ADMIN, ADMIN, OR OPERATOR
                // =================================================

                if (!isSuperAdmin && !isAdmin && !isOperator)
                {
                    throw new UnauthorizedAccessException(
                        "Only Super Admin, Admin, or Operator can create users."
                    );
                }
            }

            // =====================================================
            // 14. AUTO-GENERATE USER ID IF NOT PROVIDED & CHECK DUPLICATE
            // =====================================================

            if (string.IsNullOrWhiteSpace(userDTO.Id))
            {
                string prefix = userDTO.UserTypeId switch
                {
                    1 => "ADM",
                    2 => "STU",
                    3 => "TCH",
                    _ => "USR"
                };
                userDTO.Id = $"{prefix}_{Guid.NewGuid().ToString("N")[..8].ToUpper()}_{DateTime.UtcNow:yyyyMMddHHmmss}";
            }

            var existingUserId = await _userRepository.GetAsync(
                u => u.Id == userDTO.Id
            );

            if (existingUserId != null)
            {
                throw new Exception(
                    $"User with Id '{userDTO.Id}' already exists."
                );
            }

            // =====================================================
            // 15. CHECK DUPLICATE USERNAME
            // =====================================================

            var existingUsername = await _userRepository.GetAsync(
                u => u.Username == userDTO.Username
            );

            if (existingUsername != null)
            {
                throw new Exception(
                    $"User with username '{userDTO.Username}' already exists."
                );
            }

            // =====================================================
            // 16. CREATE USER ENTITY
            // =====================================================

            User user = _mapper.Map<User>(userDTO);

            // ID is manually entered
            user.Id = userDTO.Id;

            // =====================================================
            // 17. DEFAULT VALUES
            // =====================================================

            user.IsActive = true;
            user.IsDeleted = false;
            user.CreatedDate = DateTime.UtcNow;
            user.ModifyDate = DateTime.UtcNow;

            // =====================================================
            // 18. HASH PASSWORD
            // =====================================================

            var (passwordHash, salt) =
                CreatePasswordHashWithSalt(userDTO.Password);

            user.Password = passwordHash;
            user.PasswordSalt = salt;

            // =====================================================
            // 19. SAVE USER
            // =====================================================

            await _userRepository.CreateAsync(user);

            // =====================================================
            // 20. SAVE USER ROLES
            // =====================================================

            if (userDTO.RoleIds != null &&
                userDTO.RoleIds.Count > 0)
            {
                foreach (var roleId in userDTO.RoleIds.Distinct())
                {
                    // Valid role IDs in your current design
                    if (roleId < 1)
                    {
                        throw new ArgumentException(
                            $"Invalid RoleId: {roleId}"
                        );
                    }

                    var mapping = new UserRoleMapping
                    {
                        UserId = user.Id,
                        RoleId = roleId
                    };

                    await _userRoleRepository.CreateAsync(mapping);
                }
            }

            return true;
        }






        public async Task<List<UserDTO>> GetUser()
        {
            var user = await _userRepository.GetAllAsync();
            var dtos = _mapper.Map<List<UserDTO>>(user);

            var allMappings = await _userRoleRepository.GetAllAsync();
            var mappingsByUser = allMappings
                .Where(m => !string.IsNullOrEmpty(m.UserId))
                .GroupBy(m => m.UserId.Trim(), StringComparer.OrdinalIgnoreCase)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(m => m.RoleId).Distinct().ToList(),
                    StringComparer.OrdinalIgnoreCase
                );

            foreach (var dto in dtos)
            {
                if (!string.IsNullOrEmpty(dto.Id) && mappingsByUser.TryGetValue(dto.Id.Trim(), out var rIds))
                {
                    dto.RoleIds = rIds;
                }
                else
                {
                    dto.RoleIds = new List<int>();
                }
            }

            return dtos;
        }


        public async Task<UserDTO> GetUserByIdAsync(string Id)
        {
            if (string.IsNullOrWhiteSpace(Id)) return null!;
            var user = await _userRepository.GetAsync(u => u.Id.Equals(Id));
            if (user == null) return null!;
            var dto = _mapper.Map<UserDTO>(user);
            var mappings = await _userRoleRepository.GetAllByFilterAsync(m => m.UserId.ToLower() == Id.Trim().ToLower());
            dto.RoleIds = mappings.Select(m => m.RoleId).Distinct().ToList();
            return dto;
        }

        public async Task<UserDTO> GetUserByNameAsync(string UserName)
        {
            if (string.IsNullOrWhiteSpace(UserName)) return null!;
            var user = await _userRepository.GetAsync(u => u.Username.Equals(UserName));
            if (user == null) return null!;
            var dto = _mapper.Map<UserDTO>(user);
            var mappings = await _userRoleRepository.GetAllByFilterAsync(m => m.UserId.ToLower() == user.Id.Trim().ToLower());
            dto.RoleIds = mappings.Select(m => m.RoleId).Distinct().ToList();
            return dto;
        }


        public async Task<bool> UpdateUserAsync(UserDTO userdto)
        {
            ArgumentNullException.ThrowIfNull(userdto, nameof(userdto));

            var existingUser = await _userRepository.GetAsync(u => u.Id.Equals(userdto.Id));
            if (existingUser == null)
            {
                throw new Exception($"User not found with UserId : {userdto.Id} ");
            }
            var userToUpdate = _mapper.Map<User>(userdto);
            userToUpdate.ModifyDate = DateTime.Now;

            // Only update password if new password is provided; otherwise retain existing
            if (!string.IsNullOrEmpty(userdto.Password))
            {
                var (passwordHash, salt) = CreatePasswordHashWithSalt(userdto.Password);
                userToUpdate.Password = passwordHash;
                userToUpdate.PasswordSalt = salt;
            }
            else
            {
                userToUpdate.Password = existingUser.Password;
                userToUpdate.PasswordSalt = existingUser.PasswordSalt;
            }

            await _userRepository.UpdateAsync(userToUpdate);

            // Update user roles if provided
            if (userdto.RoleIds != null && userdto.RoleIds.Count > 0)
            {
                var existingRoles = await _userRoleRepository.GetAllByFilterAsync(m => m.UserId == userdto.Id);
                foreach (var mapping in existingRoles)
                {
                    await _userRoleRepository.DeleteAsync(mapping);
                }

                foreach (var roleId in userdto.RoleIds.Distinct())
                {
                    if (roleId > 0)
                    {
                        var newMapping = new UserRoleMapping
                        {
                            UserId = userdto.Id,
                            RoleId = roleId
                        };
                        await _userRoleRepository.CreateAsync(newMapping);
                    }
                }
            }

            return true;
        }

        public (string passwordHash,string salt) CreatePasswordHashWithSalt(string password)
        {
            // Salt generation
            var salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            // Hashing the password with the salt
           
            string hash = Convert.ToBase64String(
                Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    100000,
                    HashAlgorithmName.SHA256,
                    32));

            return (hash, Convert.ToBase64String(salt));
        }


        public async Task<bool> DeleteUserAsync(string Id)
        {
            // User to delete
            var user = await _userRepository.GetAsync(
                u => u.Id == Id
            );

            if (user == null)
            {
                throw new Exception($"User {Id} does not exist.");
            }

            // Logged-in user
            var currentUserId =
                _httpContextAccessor.HttpContext?.User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException(
                    "User is not authenticated."
                );
            }

            var currentUser = await _userRepository.GetAsync(
                u => u.Id == currentUserId
            );

            if (currentUser == null)
            {
                throw new UnauthorizedAccessException(
                    "Logged-in user not found."
                );
            }

            // =====================================================
            // NEVER DELETE ABHAY SUPER ADMIN
            // =====================================================

            if (user.Username.Equals(
                    "Abhay",
                    StringComparison.OrdinalIgnoreCase)
                && user.UserTypeId == 1)
            {
                throw new UnauthorizedAccessException(
                    "The permanent Super Admin account cannot be deleted."
                );
            }

            // =====================================================
            // ONLY SUPER ADMIN CAN DELETE ADMIN
            // =====================================================

            if (user.UserTypeId == 2) // Admin
            {
                if (currentUser.UserTypeId != 1)
                {
                    throw new UnauthorizedAccessException(
                        "Only Super Admin can delete an Admin."
                    );
                }
            }

            // =====================================================
            // SOFT DELETE
            // =====================================================

            user.IsActive = false;
            user.IsDeleted = true;
            user.ModifyDate = DateTime.UtcNow;

            await _userRepository.UpdateAsync(user);

            return true;
        }

        public async Task<List<DropdownDTO>> GetUserDropdownAsync()
        {
            var users = await _userRepository.GetAllByFilterAsync(
                x => x.IsActive && !x.IsDeleted
            );


            return users.Select(x => new DropdownDTO
            {
                Id = 0,

                Code = x.Id,

                Text = x.Username

            }).ToList();
        }
    }
}
