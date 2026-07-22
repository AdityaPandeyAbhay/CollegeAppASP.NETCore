using CollegeApp.Data;
using Repository.InterfaceOfRepository;

namespace Repository.ClassOfRepository
{
    public class StudentRepository : CollegeRepository<Student>, IStudentRepository
    {

        private readonly CollegeDBContext _dbContext;

        public StudentRepository(CollegeDBContext dbContext ): base( dbContext )
        {
            _dbContext = dbContext;
        }

      
    }
}
