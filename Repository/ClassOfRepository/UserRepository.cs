using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;

namespace Repository.ClassOfRepository
{
    public class UserRepository : CollegeRepository<User>, IUserRepository
    {
        //private readonly CollegeDBContext _dbContext;
        public UserRepository(CollegeDBContext dBContext): base(dBContext) 
        {
            
            
        }

        

     public async Task<User?> GetUserForLoginAsync(string username)
    {
        return await _dbContext.Users
            .Include(u => u.UserType)
            .Include(u => u.UserRoleMappings)
                .ThenInclude(urm => urm.Role)
            .FirstOrDefaultAsync(u => u.Username == username);
    }
}
}
