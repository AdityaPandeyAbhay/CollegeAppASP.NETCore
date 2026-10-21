using CollegeApp.Data;
using Data.Data;

namespace Repository.InterfaceOfRepository
{
    public interface IStudentRepository : ICollegeRepository<Student>
    {
        Task<List<Student>> GetAllWithDetailsAsync();
        Task<Student?> GetWithDetailsByIdAsync(int id);
        Task<List<Student>> GetWithDetailsByNameAsync(string name);
    }
}
