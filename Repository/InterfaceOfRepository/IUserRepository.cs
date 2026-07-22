using CollegeApp.Data;

namespace Repository.InterfaceOfRepository
{
    public interface IUserRepository : ICollegeRepository<User>
    {
        Task<User?> GetUserForLoginAsync(string username);
    }
}
