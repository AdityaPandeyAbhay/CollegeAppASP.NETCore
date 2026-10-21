using CollegeApp.Data;
using Data.Data;
using Repository.InterfaceOfRepository;

namespace Repository.ClassOfRepository
{
    public class TeacherRepository : CollegeRepository<Teacher>, ITeacherRepository
    {
        public TeacherRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {
        }
    }
}