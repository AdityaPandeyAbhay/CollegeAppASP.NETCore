using CollegeApp.Models;
using Model.Models;

namespace CollegeApp.Services
{
    public interface IUserService
    {
        Task<bool> CreateUserAsync(UserDTO userDTO);
         Task<List<UserDTO>> GetUser();
        Task<UserDTO> GetUserByIdAsync(string Id);

        Task<UserDTO> GetUserByNameAsync(string UserName);

        Task<bool> UpdateUserAsync(UserDTO userdto);

        Task<bool> DeleteUserAsync(string Id);
        (string passwordHash, string salt) CreatePasswordHashWithSalt(string password);
        Task<List<DropdownDTO>> GetUserDropdownAsync();
    }
}
