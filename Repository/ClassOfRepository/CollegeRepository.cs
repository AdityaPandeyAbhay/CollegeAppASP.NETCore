using CollegeApp.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;
using System.Linq.Expressions;

namespace Repository.ClassOfRepository
{
    public class CollegeRepository<T> : ICollegeRepository<T> where T : class
    {
        protected readonly CollegeDBContext _dbContext;
        private readonly DbSet<T> _dbSet;
        public CollegeRepository(CollegeDBContext dbContext)
        { 

            _dbContext = dbContext;
            _dbSet = _dbContext.Set<T>();          }



        public async Task<T> CreateAsync(T dbRecord)
        {
            await _dbSet.AddAsync(dbRecord);
            await _dbContext.SaveChangesAsync();
            return dbRecord;
        }




        public async Task<bool> DeleteAsync(T dbRecord)
        {

            _dbSet.Remove(dbRecord);
            await _dbContext.SaveChangesAsync();
            return true;
        }




        public async Task<List<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }



        public async Task<List<T>> GetAllByFilterAsync(Expression<Func<T, bool>> filter, bool useNoTracking = false)
        {
            if (useNoTracking)
            {
                return await _dbSet
                    .AsNoTracking()
                    .Where(filter)
                    .ToListAsync();
            }
            else
            {
                return await _dbSet
                    .Where(filter)
                    .ToListAsync();
            }
        }



        public async Task<T?> GetAsync(Expression<Func<T, bool>> filter, bool useNoTracking = false)
        {
            if (useNoTracking)
            {
                return await _dbSet.AsNoTracking().FirstOrDefaultAsync(filter);
            }

            return await _dbSet.FirstOrDefaultAsync(filter);
        }

        //public async Task<T?> GetByNameAsync(Expression<Func<T, bool>> filter)
        //{
        //    return await _dbSet.FirstOrDefaultAsync(filter);
        //}

        public async Task<T> UpdateAsync(T dbRecord)
        {
           
            _dbContext.Update(dbRecord);
            await _dbContext.SaveChangesAsync();

            return dbRecord;

        }


       
    }
}
