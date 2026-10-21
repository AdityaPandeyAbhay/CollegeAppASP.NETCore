using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;

namespace Repository.ClassOfRepository
{
    public class StudentRepository : CollegeRepository<Student>, IStudentRepository
    {
        public StudentRepository(CollegeDBContext dbContext) : base(dbContext)
        {
        }

        public async Task<List<Student>> GetAllWithDetailsAsync()
        {
            return await _dbContext.Students
                .Include(s => s.CreatedByUser)
                .Include(s => s.UpdatedByUser)
                .Include(s => s.Department)
                .Include(s => s.SchoolClass)
                .Include(s => s.Section)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.AcademicYear)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.Department)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.SchoolClass)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.Section)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Student?> GetWithDetailsByIdAsync(int id)
        {
            return await _dbContext.Students
                .Include(s => s.CreatedByUser)
                .Include(s => s.UpdatedByUser)
                .Include(s => s.Department)
                .Include(s => s.SchoolClass)
                .Include(s => s.Section)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.AcademicYear)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.Department)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.SchoolClass)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.Section)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<List<Student>> GetWithDetailsByNameAsync(string name)
        {
            var lower = name.ToLower();
            return await _dbContext.Students
                .Include(s => s.CreatedByUser)
                .Include(s => s.UpdatedByUser)
                .Include(s => s.Department)
                .Include(s => s.SchoolClass)
                .Include(s => s.Section)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.AcademicYear)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.Department)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.SchoolClass)
                .Include(s => s.StudentAcademicYears)
                    .ThenInclude(say => say.Section)
                .AsNoTracking()
                .Where(s =>
                    s.FirstName.ToLower().Contains(lower) ||
                    (s.MiddleName != null && s.MiddleName.ToLower().Contains(lower)) ||
                    s.LastName.ToLower().Contains(lower)
                )
                .ToListAsync();
        }
    }
}
