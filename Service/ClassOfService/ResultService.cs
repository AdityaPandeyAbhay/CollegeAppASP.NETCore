using System;
using System.Collections.Generic;
using System.Text;
using AutoMapper;
using CollegeApp.Data;
using Data.Data;
using Model.Models.Result_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;

namespace Service.ClassOfService
{
    public partial class ResultService : IResultService
    {
        private readonly IResultRepository _resultRepository;
        private readonly ICollegeRepository<Exam> _examRepository;
        private readonly ICollegeRepository<ResultBatch> _resultBatchRepository;
        private readonly ICollegeRepository<Result> _resultCrudRepository;
        private readonly ICollegeRepository<ResultDetail> _resultDetailRepository;
        private readonly ICurrentUserServices _currentUserService;
        private readonly IMapper _mapper;

        public ResultService(
            IResultRepository resultRepository,
            ICollegeRepository<Exam> examRepository,
            ICollegeRepository<ResultBatch> resultBatchRepository,
            ICollegeRepository<Result> resultCrudRepository,
            ICollegeRepository<ResultDetail> resultDetailRepository,
            ICurrentUserServices currentUserService,
            IMapper mapper)
        {
            _resultRepository = resultRepository;
            _examRepository = examRepository;
            _resultBatchRepository = resultBatchRepository;
            _resultCrudRepository = resultCrudRepository;
            _resultDetailRepository = resultDetailRepository;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        #region Exam
        public async Task<List<ExamResponseDTO>> GetAllExamsAsync()
        {
            var exams = await _resultRepository.GetAllExamsAsync();

            return _mapper.Map<List<ExamResponseDTO>>(exams);
        }
        public async Task<ExamResponseDTO?> GetExamByIdAsync(int id)
        {
            var exam = await _resultRepository.GetExamByIdAsync(id);

            if (exam == null)
            {
                throw new Exception($"Exam not found with Id : {id}");
            }

            return _mapper.Map<ExamResponseDTO>(exam);
        }
        public async Task<ExamResponseDTO> CreateExamAsync(CreateExamDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var exists = await _resultRepository.ExamExistsAsync(dto.ExamName);

            if (exists)
            {
                throw new Exception($"{dto.ExamName} already exists.");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var exam = _mapper.Map<Exam>(dto);

            exam.CreatedBy = currentUserId;
            exam.CreatedDate = DateTime.UtcNow;

            exam.UpdatedBy = currentUserId;
            exam.UpdatedDate = DateTime.UtcNow;

            await _examRepository.CreateAsync(exam);

            return _mapper.Map<ExamResponseDTO>(exam);
        }
        public async Task<ExamResponseDTO> UpdateExamAsync(int id, UpdateExamDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var exam = await _examRepository.GetAsync(x => x.Id == id);

            if (exam == null)
            {
                throw new Exception($"Exam not found with Id : {id}");
            }

            var duplicate = await _examRepository.GetAsync(x =>
                x.ExamName == dto.ExamName &&
                x.Id != id);

            if (duplicate != null)
            {
                throw new Exception($"{dto.ExamName} already exists.");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            _mapper.Map(dto, exam);

            exam.UpdatedBy = currentUserId;
            exam.UpdatedDate = DateTime.UtcNow;

            await _examRepository.UpdateAsync(exam);

            return _mapper.Map<ExamResponseDTO>(exam);
        }
        public async Task<bool> DeleteExamAsync(int id)
        {
            var exam = await _examRepository.GetAsync(x => x.Id == id);

            if (exam == null)
            {
                throw new Exception($"Exam not found with Id : {id}");
            }

            await _examRepository.DeleteAsync(exam);

            return true;
        }

        #endregion

        #region Result Batch

        public async Task<ResultBatchResponseDTO> CreateResultBatchAsync(CreateResultBatchDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var existingBatch = await _resultRepository.GetResultBatchAsync(
                dto.AcademicYearId,
                dto.ClassId,
                dto.SectionId,
                dto.ExamId);

            if (existingBatch != null)
            {
                throw new Exception("Result Batch already exists.");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var batch = _mapper.Map<ResultBatch>(dto);

            batch.IsPublished = false;
            batch.CreatedBy = currentUserId;
            batch.CreatedDate = DateTime.UtcNow;
            batch.UpdatedBy = currentUserId;
            batch.UpdatedDate = DateTime.UtcNow;

            await _resultBatchRepository.CreateAsync(batch);

            batch = await _resultRepository.GetResultBatchByIdAsync(batch.Id);

            return _mapper.Map<ResultBatchResponseDTO>(batch);
        }
        public async Task<List<ResultBatchResponseDTO>> GetAllResultBatchesAsync()
        {
            var batches = await _resultRepository.GetAllResultBatchesAsync();

            return _mapper.Map<List<ResultBatchResponseDTO>>(batches);
        }
        public async Task<ResultBatchResponseDTO?> GetResultBatchByIdAsync(int id)
        {
            var batch = await _resultRepository.GetResultBatchByIdAsync(id);

            if (batch == null)
            {
                throw new Exception($"Result Batch not found with Id : {id}");
            }

            return _mapper.Map<ResultBatchResponseDTO>(batch);
        }

        public async Task<bool> PublishResultBatchAsync(int resultBatchId)
        {
            var batch = await _resultBatchRepository.GetAsync(x => x.Id == resultBatchId);

            if (batch == null)
            {
                throw new Exception($"Result Batch not found with Id : {resultBatchId}");
            }

            if (batch.IsPublished)
            {
                throw new Exception("Result Batch is already published.");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            batch.IsPublished = true;
            batch.UpdatedBy = currentUserId;
            batch.UpdatedDate = DateTime.UtcNow;

            await _resultBatchRepository.UpdateAsync(batch);

            return true;
        }
        public async Task<bool> DeleteResultBatchAsync(int id)
        {
            var batch = await _resultBatchRepository.GetAsync(x => x.Id == id);

            if (batch == null)
            {
                throw new Exception($"Result Batch not found with Id : {id}");
            }

            await _resultBatchRepository.DeleteAsync(batch);

            return true;
        }

        #endregion


        #region Result
        public async Task<StudentResultDTO?> GetResultByIdAsync(int resultId)
        {
            var result =
                await _resultRepository.GetResultWithDetailsAsync(resultId);


            if (result == null)
                throw new Exception("Result not found.");


            return _mapper.Map<StudentResultDTO>(result);
        }
        public async Task<StudentResultDTO?> GetStudentResultAsync(
    int resultBatchId,
    int studentId)
        {
            var result = await _resultRepository.GetStudentResultAsync(
                resultBatchId,
                studentId);

            if (result == null)
            {
                throw new Exception("Student result not found.");
            }

            return _mapper.Map<StudentResultDTO>(result);
        }
        public async Task<List<StudentResultDTO>> GetBatchResultsAsync(int resultBatchId)
        {
            var results = await _resultRepository.GetResultsByBatchAsync(resultBatchId);

            return _mapper.Map<List<StudentResultDTO>>(results);
        }
        public async Task<List<StudentResultDTO>> GetStudentPreviousResultsAsync(int studentId)
        {
            var results = await _resultRepository.GetStudentPreviousResultsAsync(studentId);

            return _mapper.Map<List<StudentResultDTO>>(results);
        }

        #endregion
        #region Result Detail
        public async Task<List<ResultDetailDTO>> GetResultDetailsAsync(int resultId)
        {
            var details = await _resultRepository.GetResultDetailsAsync(resultId);

            return _mapper.Map<List<ResultDetailDTO>>(details);
        }

        public async Task<bool> UploadStudentResultAsync(ResultUploadDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);


            var existingResult = await _resultRepository.GetStudentResultAsync(
                dto.ResultBatchId,
                dto.StudentId);


            if (existingResult != null)
            {
                throw new Exception("Student Result already exists.");
            }


            var currentUserId = _currentUserService.UserId;


            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException(
                    "User is not authenticated.");
            }


            var result = new Result
            {
                ResultBatchId = dto.ResultBatchId,

                StudentId = dto.StudentId,

                CreatedBy = currentUserId,

                CreatedDate = DateTime.UtcNow,

                UpdatedBy = currentUserId,

                UpdatedDate = DateTime.UtcNow
            };


            result.TotalMarks =
                dto.Subjects.Sum(x => x.MaxMarks);


            result.ObtainedMarks =
                dto.Subjects.Sum(x => x.ObtainedMarks);


            result.Percentage =
                result.TotalMarks == 0
                ? 0
                : (result.ObtainedMarks / result.TotalMarks) * 100;


            result.Grade =
                CalculateGrade(result.Percentage);


            result.ResultStatus =
                result.Percentage >= 33
                ? "Pass"
                : "Fail";


            await _resultCrudRepository.CreateAsync(result);



            foreach (var item in dto.Subjects)
            {
                var detail = _mapper.Map<ResultDetail>(item);


                detail.ResultId = result.Id;


                await _resultDetailRepository.CreateAsync(detail);
            }


            return true;
        }

        public async Task<bool> UpdateStudentResultAsync(ResultUploadDTO dto)
        {
            var result = await _resultCrudRepository.GetAsync(
                x => x.Id == dto.ResultId);


            if (result == null)
                throw new Exception("Result not found.");


            result.TotalMarks =
                dto.Subjects.Sum(x => x.MaxMarks);


            result.ObtainedMarks =
                dto.Subjects.Sum(x => x.ObtainedMarks);


            result.Percentage =
                result.TotalMarks == 0
                ? 0
                : (result.ObtainedMarks /
                  result.TotalMarks) * 100;


            result.Grade =
                CalculateGrade(result.Percentage);


            result.ResultStatus =
                result.Percentage >= 33
                ? "Pass"
                : "Fail";


            result.UpdatedBy =
                _currentUserService.UserId;


            result.UpdatedDate =
                DateTime.UtcNow;



            await _resultCrudRepository.UpdateAsync(result);



            await _resultRepository
                .DeleteResultDetailsAsync(result.Id);



            foreach (var item in dto.Subjects)
            {
                var detail =
                    _mapper.Map<ResultDetail>(item);


                detail.ResultId = result.Id;


                await _resultDetailRepository
                    .CreateAsync(detail);
            }


            return true;
        }
        private string CalculateGrade(decimal percentage)
        {
            if (percentage >= 90)
                return "A+";

            if (percentage >= 80)
                return "A";

            if (percentage >= 70)
                return "B";

            if (percentage >= 60)
                return "C";

            if (percentage >= 50)
                return "D";

            if (percentage >= 33)
                return "E";

            return "F";
        }
        #endregion
    }
}