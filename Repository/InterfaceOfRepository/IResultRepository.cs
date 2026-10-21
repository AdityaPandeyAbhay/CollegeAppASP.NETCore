using Data.Data;
using Model.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.InterfaceOfRepository
{
    public interface IResultRepository     {
        #region Exam

        Task<List<Exam>> GetAllExamsAsync();
        Task<Exam?> GetExamByIdAsync(int id);
        Task<bool> ExamExistsAsync(string examName);

        #endregion

        #region Result Batch

        Task<ResultBatch?> GetResultBatchByIdAsync(int id);

        Task<ResultBatch?> GetResultBatchAsync(
            int academicYearId,
            int classId,
            int sectionId,
            int examId);

        Task<List<ResultBatch>> GetAllResultBatchesAsync();

        #endregion

        #region Result

        Task<Result?> GetResultByIdAsync(int id);

        Task<List<Result>> GetResultsByBatchAsync(int resultBatchId);

        Task<Result?> GetStudentResultAsync(
            int resultBatchId,
            int studentId);

        Task<List<Result>> GetStudentPreviousResultsAsync(
            int studentId);

        Task<bool> DeleteResultDetailsAsync(int resultId);

        Task<Result?> GetResultWithDetailsAsync(int resultId);
        #endregion

        #region Result Detail

        Task<List<ResultDetail>> GetResultDetailsAsync(
            int resultId);

        #endregion

        #region Student

        Task<List<Student>> GetStudentsByClassSectionAsync(
            int classId,
            int sectionId);

        #endregion


        ///DropDown
        Task<List<DropdownDTO>> GetExamDropdownAsync();

        Task<List<DropdownDTO>> GetResultBatchDropdownAsync(int examId);

        Task<List<DropdownDTO>> GetResultDropdownAsync(int resultBatchId);

        Task<List<DropdownDTO>> GetStudentResultDropdownAsync(int resultBatchId,int studentId);

        Task<List<DropdownDTO>> GetResultDetailDropdownAsync(int resultId);
    }
}
