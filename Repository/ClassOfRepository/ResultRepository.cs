using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Repository.InterfaceOfRepository;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.ClassOfRepository
{
    public class ResultRepository : IResultRepository
    {
        private readonly CollegeDBContext _dbContext;

        public ResultRepository(CollegeDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        #region Exam

        public async Task<List<Exam>> GetAllExamsAsync()
        {
            return await _dbContext.Exams
                .OrderBy(x => x.ExamName)
                .ToListAsync();
        }

        public async Task<Exam?> GetExamByIdAsync(int id)
        {
            return await _dbContext.Exams
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<bool> ExamExistsAsync(string examName)
        {
            return await _dbContext.Exams
                .AnyAsync(x => x.ExamName == examName);
        }

        #endregion

        #region Result Batch

        public async Task<ResultBatch?> GetResultBatchByIdAsync(int id)
        {
            return await _dbContext.ResultBatches
                .Include(x => x.AcademicYear)
                .Include(x => x.SchoolClass)
                .Include(x => x.Section)
                .Include(x => x.Exam)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<ResultBatch?> GetResultBatchAsync(
            int academicYearId,
            int classId,
            int sectionId,
            int examId)
        {
            return await _dbContext.ResultBatches
                .FirstOrDefaultAsync(x =>
                    x.AcademicYearId == academicYearId &&
                    x.ClassId == classId &&
                    x.SectionId == sectionId &&
                    x.ExamId == examId);
        }

        public async Task<List<ResultBatch>> GetAllResultBatchesAsync()
        {
            return await _dbContext.ResultBatches
                .Include(x => x.AcademicYear)
                .Include(x => x.SchoolClass)
                .Include(x => x.Section)
                .Include(x => x.Exam)
                .OrderByDescending(x => x.CreatedDate)
                .ToListAsync();
        }

        #endregion

        #region Result

        public async Task<Result?> GetResultByIdAsync(int id)
        {
            return await _dbContext.Results
                .Include(x => x.Student)
                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.Exam)
                .Include(x => x.ResultDetails)
                    .ThenInclude(x => x.Subject)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<Result>> GetResultsByBatchAsync(int resultBatchId)
        {
            return await _dbContext.Results
                .Where(x => x.ResultBatchId == resultBatchId)
                .Include(x => x.Student)
                .Include(x => x.ResultDetails)
                    .ThenInclude(x => x.Subject)
                .OrderBy(x => x.Student.FirstName)
                .ToListAsync();
        }

        public async Task<Result?> GetStudentResultAsync(
     int resultBatchId,
     int studentId)
        {
            return await _dbContext.Results

                .Include(x => x.Student)

                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.Exam)

                .Include(x => x.ResultDetails)
                    .ThenInclude(x => x.Subject)

                .FirstOrDefaultAsync(x =>
                    x.ResultBatchId == resultBatchId &&
                    x.StudentId == studentId);
        }

        public async Task<List<Result>> GetStudentPreviousResultsAsync(int studentId)
        {
            return await _dbContext.Results
                .Where(x => x.StudentId == studentId)
                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.AcademicYear)
                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.Exam)
                .Include(x => x.ResultDetails)
                    .ThenInclude(x => x.Subject)
                .OrderByDescending(x => x.ResultBatch.AcademicYear.StartDate)
                .ToListAsync();
        }
        public async Task<Result?> GetResultWithDetailsAsync(int id)
        {
            return await _dbContext.Results

                .Include(x => x.Student)

                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.AcademicYear)

                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.SchoolClass)

                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.Section)

                .Include(x => x.ResultBatch)
                    .ThenInclude(x => x.Exam)

                .Include(x => x.ResultDetails)
                    .ThenInclude(x => x.Subject)

                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<bool> DeleteResultDetailsAsync(int resultId)
        {
            var details = await _dbContext.ResultDetails
                .Where(x => x.ResultId == resultId)
                .ToListAsync();


            if (details.Any())
            {
                _dbContext.ResultDetails.RemoveRange(details);
                await _dbContext.SaveChangesAsync();
            }


            return true;
        }

        #endregion

        #region Result Detail

        public async Task<List<ResultDetail>> GetResultDetailsAsync(int resultId)
        {
            return await _dbContext.ResultDetails
                .Where(x => x.ResultId == resultId)
                .Include(x => x.Subject)
                .OrderBy(x => x.Subject.SubjectName)
                .ToListAsync();
        }

        #endregion

        #region Student

        public async Task<List<Student>> GetStudentsByClassSectionAsync(
            int classId,
            int sectionId)
        {
            return await _dbContext.Students
                .Where(x =>
                    x.SchoolClassId == classId &&
                    x.SectionId == sectionId &&
                    x.IsActive)
                .OrderBy(x => x.AdmissionNumber)
                .ToListAsync();
        }

        #endregion
    }
}
