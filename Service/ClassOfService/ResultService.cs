using AutoMapper;
using CollegeApp.Data;
using Data.Data;
using Microsoft.AspNetCore.Hosting;
using Model.Models;
using Model.Models.Result_Model;
using Repository.ClassOfRepository;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

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
        private readonly IWebHostEnvironment _environment;
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        

        public ResultService(
            IResultRepository resultRepository,
            ICollegeRepository<Exam> examRepository,
            ICollegeRepository<ResultBatch> resultBatchRepository,
            ICollegeRepository<Result> resultCrudRepository,
            ICollegeRepository<ResultDetail> resultDetailRepository,
            ICurrentUserServices currentUserService,
            IMapper mapper, IWebHostEnvironment environment,IUserRepository userRepository,IStudentRepository studentRepository            )
        {
            _resultRepository = resultRepository;
            _examRepository = examRepository;
            _resultBatchRepository = resultBatchRepository;
            _resultCrudRepository = resultCrudRepository;
            _resultDetailRepository = resultDetailRepository;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _environment = environment;
            _studentRepository = studentRepository;
            _userRepository = userRepository;
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
        public async Task<StudentResultDTO?> GetStudentResultAsync(int resultBatchId,int studentId)
        {
            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                throw new UnauthorizedAccessException(
                    "User is not authenticated.");
            }

            // Get logged-in user's Studentrecord using UserId
            var loggedInStudent = await _studentRepository. GetAsync(
                x => x.UserId == currentUserId);

            if (loggedInStudent == null)
            {
                throw new Exception(
                    "Student record not found for the logged-in user.");
            }

            // Check whether logged-in user is Student
            var user = await _userRepository.GetAsync(
                x => x.Id == currentUserId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // If logged-in user is Student,
            // force studentId to his own StudentId.
            if (user.UserTypeId == 5) // Student UserType
            {
                if (loggedInStudent.Id != studentId)
                {
                    throw new UnauthorizedAccessException(
                        "You are not authorized to view another student's result.");
                }
            }

            // Existing flow
            var result = await _resultRepository.GetStudentResultAsync(
                resultBatchId,
                studentId);

            if (result == null)
            {
                return null;
            }

            return new StudentResultDTO
            {
                ResultId = result.Id,
                StudentId = result.StudentId,

                AdmissionNumber =
                    result.Student.AdmissionNumber ?? string.Empty,

                StudentName =
                    $"{result.Student.FirstName} {result.Student.LastName}".Trim(),

                TotalMarks = result.TotalMarks,
                ObtainedMarks = result.ObtainedMarks,
                Percentage = result.Percentage,
                Grade = result.Grade,
                Rank = result.Rank,
                ResultStatus = result.ResultStatus,

                PdfFileName = result.PdfFileName,
                PdfFilePath = result.PdfFilePath,
                PublishedDate = result.PublishedDate,

                Subjects = result.ResultDetails.Select(x => new ResultDetailDTO
                {
                    SubjectId = x.SubjectId,
                    SubjectName = x.Subject.SubjectName,
                    MaxMarks = x.MaxMarks,
                    ObtainedMarks = x.ObtainedMarks,
                    Grade = x.Grade,
                    Remarks = x.Remarks
                }).ToList()
            };
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
            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                throw new UnauthorizedAccessException(
                    "User is not authenticated.");
            }

            // Get result first
            var result = await _resultRepository.GetResultByIdAsync(resultId);

            if (result == null)
            {
                throw new Exception("Result not found.");
            }

            // Get logged-in student
            var loggedInStudent = await _studentRepository.GetAsync(
                x => x.UserId == currentUserId);

            if (loggedInStudent == null)
            {
                throw new Exception(
                    "Student record not found for the logged-in user.");
            }

            // Get logged-in user
            var user = await _userRepository.GetAsync(
                x => x.Id == currentUserId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            // Student can only see his own Result Detail
            if (user.UserTypeId == 5)
            {
                if (result.StudentId != loggedInStudent.Id)
                {
                    throw new UnauthorizedAccessException(
                        "You are not authorized to view another student's result details.");
                }
            }

            // Existing Result Detail flow
            var details = await _resultRepository.GetResultDetailsAsync(resultId);

            return details.Select(x => new ResultDetailDTO
            {
                SubjectId = x.SubjectId,
                SubjectName = x.Subject.SubjectName,
                MaxMarks = x.MaxMarks,
                ObtainedMarks = x.ObtainedMarks,
                Grade = x.Grade,
                Remarks = x.Remarks
            }).ToList();
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


            // ==========================================
            // CALCULATE TOTAL MARKS
            // ==========================================

            result.TotalMarks =
                dto.Subjects.Sum(x => x.MaxMarks);


            result.ObtainedMarks =
                dto.Subjects.Sum(x => x.ObtainedMarks);


            // ==========================================
            // CALCULATE PERCENTAGE
            // ==========================================

            result.Percentage =
                result.TotalMarks == 0
                ? 0
                : (result.ObtainedMarks / result.TotalMarks) * 100;


            // ==========================================
            // CALCULATE GRADE
            // ==========================================

            result.Grade =
                CalculateGrade(result.Percentage);


            // ==========================================
            // RESULT STATUS
            // ==========================================

            result.ResultStatus =
                result.Percentage >= 33
                ? "Pass"
                : "Fail";


            // ==========================================
            // PDF UPLOAD
            // ==========================================

            if (dto.PdfFile != null && dto.PdfFile.Length > 0)
            {
                // Only PDF allowed
                if (!string.Equals(
                        Path.GetExtension(dto.PdfFile.FileName),
                        ".pdf",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new Exception("Only PDF files are allowed.");
                }


                // Maximum 10 MB
                const long maxFileSize = 10 * 1024 * 1024;

                if (dto.PdfFile.Length > maxFileSize)
                {
                    throw new Exception(
                        "PDF file size cannot exceed 10 MB.");
                }


                // ==========================================
                // WWWROOT PATH
                // ==========================================

                string webRootPath = _environment.WebRootPath;

                if (string.IsNullOrWhiteSpace(webRootPath))
                {
                    webRootPath = Path.Combine(
                        _environment.ContentRootPath,
                        "wwwroot");
                }


                // ==========================================
                // RESULTS FOLDER
                // ==========================================

                string resultsFolder = Path.Combine(
                    webRootPath,
                    "Results");


                if (!Directory.Exists(resultsFolder))
                {
                    Directory.CreateDirectory(resultsFolder);
                }


                // ==========================================
                // ORIGINAL FILE NAME
                // ==========================================

                string originalFileName =
                    Path.GetFileName(dto.PdfFile.FileName);


                // ==========================================
                // UNIQUE FILE NAME
                // ==========================================

                string storedFileName =
                    $"{Guid.NewGuid()}.pdf";


                // ==========================================
                // PHYSICAL FILE PATH
                // ==========================================

                string physicalFilePath =
                    Path.Combine(
                        resultsFolder,
                        storedFileName);


                // ==========================================
                // SAVE PDF
                // ==========================================

                using (var stream = new FileStream(
                    physicalFilePath,
                    FileMode.Create))
                {
                    await dto.PdfFile.CopyToAsync(stream);
                }


                // ==========================================
                // STORE PDF INFORMATION IN DATABASE
                // ==========================================

                result.PdfFileName =
                    originalFileName;

                result.PdfFilePath =
                    $"/Results/{storedFileName}";
            }


            // ==========================================
            // SAVE RESULT
            // ==========================================

            await _resultCrudRepository.CreateAsync(result);


            // ==========================================
            // RESULT DETAILS
            // ==========================================

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



        public async Task<List<DropdownDTO>> GetExamDropdownAsync()
        {
            return await _resultRepository
                .GetExamDropdownAsync();
        }


        public async Task<List<DropdownDTO>> GetResultBatchDropdownAsync(
            int examId)
        {
            if (examId <= 0)
                throw new ArgumentException("Invalid Exam Id.");

            return await _resultRepository
                .GetResultBatchDropdownAsync(examId);
        }


        public async Task<List<DropdownDTO>> GetResultDropdownAsync(
            int resultBatchId)
        {
            if (resultBatchId <= 0)
                throw new ArgumentException(
                    "Invalid Result Batch Id.");

            return await _resultRepository
                .GetResultDropdownAsync(resultBatchId);
        }


        public async Task<List<DropdownDTO>> GetStudentResultDropdownAsync(int resultBatchId)
        {
            if (resultBatchId <= 0)
            {
                throw new ArgumentException(
                    "Invalid Result Batch Id.");
            }

            // Logged-in User Id
            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                throw new UnauthorizedAccessException(
                    "User is not authenticated.");
            }

            // Find Student using UserId
            var student = await _studentRepository.GetAsync(
                x => x.UserId == currentUserId);

            if (student == null)
            {
                throw new Exception(
                    "Student record not found for the logged-in user.");
            }

            // Get only this student's result
            return await _resultRepository.GetStudentResultDropdownAsync(
                resultBatchId,
                student.Id);
        }


        public async Task<List<DropdownDTO>> GetResultDetailDropdownAsync(
            int resultId)
        {
            if (resultId <= 0)
                throw new ArgumentException(
                    "Invalid Result Id.");

            return await _resultRepository
                .GetResultDetailDropdownAsync(resultId);
        }
    }
}