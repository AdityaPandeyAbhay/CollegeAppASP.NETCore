using AutoMapper;
using CollegeApp.Data;
using CollegeApp.Models;
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


        public UserService(IUserRepository userRepository,IMapper mapper, ICollegeRepository<UserRoleMapping> userRoleRepository)
        {
            _userRepository = userRepository;
            _mapper = mapper;
            _userRoleRepository = userRoleRepository;
        }


        public async Task<bool> CreateUserAsync(UserDTO userDTO)
        {
            ArgumentNullException.ThrowIfNull(userDTO, $"the argumen {nameof(userDTO)} is null");

            var existingUser = await _userRepository.GetAsync(u => u.Username == userDTO.Username);
            if (existingUser != null) 
            {
                throw new Exception($"User with username {userDTO.Username} already exists.");
            }

            User user = _mapper.Map<User>(userDTO);
            user.IsDeleted = false;
            user.CreatedDate = DateTime.UtcNow;
            user.ModifyDate = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(userDTO.Password))
            {
                var (passwordHash, salt) = CreatePasswordHashWithSalt(userDTO.Password);
                user.Password = passwordHash;
                user.PasswordSalt = salt;
            }
            else
            {
                throw new ArgumentException("Password cannot be null or empty.");
            }

            await _userRepository.CreateAsync(user);

            foreach (var roleId in userDTO.RoleIds)
            {
                var mapping = new UserRoleMapping
                {
                    UserId = user.Id,
                    RoleId = roleId
                };

                await _userRoleRepository.CreateAsync(mapping);
            }



            return true;
        }



        public async Task<List<UserDTO>> GetUser()
        {
            var user = await _userRepository.GetAllAsync();
          
            return _mapper.Map<List<UserDTO>>(user);
        }


        public async Task<UserDTO> GetUserByIdAsync(string Id)
        {
            var user = await _userRepository.GetAsync(u => u.Id.Equals(Id));
           
            return _mapper.Map<UserDTO>(user);
        }

        public async Task<UserDTO> GetUserByNameAsync(string UserName)
        {
            var user = await _userRepository.GetAsync(u => u.Username.Equals(UserName));

            return _mapper.Map<UserDTO>(user);
        }


        public async Task<bool> UpdateUserAsync(UserDTO userdto)
        {
            ArgumentNullException.ThrowIfNull(userdto, nameof(userdto));

            var existingUser = await _userRepository.GetAsync(u => u.Id.Equals(userdto.Id));
            if (existingUser == null)
            {
                throw new Exception($"User not found with UserId : {userdto.Id} ");
            }
            var userToUpdate =_mapper.Map<User>(userdto);
            userToUpdate.ModifyDate = DateTime.Now;


            // only update user not password 
            //only demo update the password

            if (!string.IsNullOrEmpty(userdto.Password))
            {
                var (passwordHash, salt) = CreatePasswordHashWithSalt(userdto.Password);
                userToUpdate.Password = passwordHash;
                userToUpdate.PasswordSalt = salt;
            }


            await _userRepository.UpdateAsync(userToUpdate);

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
            var user = await _userRepository.GetAsync(u => u.Id.Equals(Id));
            if (user == null)
            {
                throw new Exception($"USer {Id} not  Exist");  
            }
            await _userRepository.DeleteAsync(user);
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
