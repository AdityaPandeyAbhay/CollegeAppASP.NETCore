using Model.Models;
using Model.Models.Result_Model;

namespace Service.InterfaceOfService
{
    public interface IResultService
    {
        #region Exam

        Task<List<ExamResponseDTO>> GetAllExamsAsync();

        Task<ExamResponseDTO?> GetExamByIdAsync(int id);

        Task<ExamResponseDTO> CreateExamAsync(CreateExamDTO dto);

        Task<ExamResponseDTO> UpdateExamAsync(int id, UpdateExamDTO dto);

        Task<bool> DeleteExamAsync(int id);

        #endregion


        #region Result Batch

        Task<ResultBatchResponseDTO> CreateResultBatchAsync(CreateResultBatchDTO dto);

        Task<List<ResultBatchResponseDTO>> GetAllResultBatchesAsync();

        Task<ResultBatchResponseDTO?> GetResultBatchByIdAsync(int id);

        Task<bool> PublishResultBatchAsync(int resultBatchId);

        Task<bool> DeleteResultBatchAsync(int id);

        #endregion


        #region Result


        Task<StudentResultDTO?> GetResultByIdAsync(
            int resultId);


        Task<StudentResultDTO?> GetStudentResultAsync(
            int resultBatchId,
            int studentId);


        Task<List<StudentResultDTO>> GetBatchResultsAsync(
            int resultBatchId);


        Task<List<StudentResultDTO>> GetStudentPreviousResultsAsync(
            int studentId);


        #endregion


        #region Result Detail

        Task<bool> UploadStudentResultAsync(ResultUploadDTO dto);

        Task<bool> UpdateStudentResultAsync(ResultUploadDTO dto);

        Task<List<ResultDetailDTO>> GetResultDetailsAsync(int resultId);

        #endregion




        Task<List<DropdownDTO>> GetExamDropdownAsync();

        Task<List<DropdownDTO>> GetResultBatchDropdownAsync(
            int examId);

        Task<List<DropdownDTO>> GetResultDropdownAsync(
            int resultBatchId);

        Task<List<DropdownDTO>> GetResultDetailDropdownAsync(
            int resultId);
    }
}