using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Model.Models.Notice_Model;
using Repository.InterfaceOfRepository;

namespace Repository.ClassOfRepository
{
    public class NoticeRepository : CollegeRepository<Notice>, INoticeRepository
    {
        private readonly CollegeDBContext _context;

        public NoticeRepository(CollegeDBContext dbContext)
            : base(dbContext)
        {
            _context = dbContext;
        }

        public async Task<List<Notice>> GetNonPublishedAsync()
        {
            return await _context.Notices
                .Where(x => !x.IsPublished && x.IsActive)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        public async Task<List<Notice>> GetAllPublishedAsync()
        {
            return await _context.Notices
                .Where(x => x.IsPublished && x.IsActive)
                .OrderByDescending(x => x.PublishedDate)
                .ToListAsync();
        }

        public async Task<Notice?> GetByIdAsync(int id)
        {
            return await _context.Notices
                .FirstOrDefaultAsync(x => x.Id == id);
        }


        public async Task<List<Notice>> GetNonPublishedDropAsync()
        {
            return await _context.Notices
                .Where(x => !x.IsPublished && x.IsActive)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }
    }
}