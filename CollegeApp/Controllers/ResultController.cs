using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Result_Model;
using Service.InterfaceOfService;
using CollegeApp.Models;
using System.Net;


namespace CollegeApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ResultController : ControllerBase
    {
        private readonly IResultService _service;
        private readonly APIResponse _apiResponse;

        public ResultController(IResultService service)
        {
            _service = service;
            _apiResponse = new();
        }


        #region Exam


        [HttpPost("CreateExam")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> CreateExam(CreateExamDTO dto)
        {
            try
            {
                var result = await _service.CreateExamAsync(dto);

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpGet("AllExam")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> GetAllExam()
        {
            try
            {
                var result = await _service.GetAllExamsAsync();

                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;

                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpGet("Exam/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> GetExamById(int id)
        {
            try
            {
                var result = await _service.GetExamByIdAsync(id);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpPut("UpdateExam/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> UpdateExam(
            int id,
            UpdateExamDTO dto)
        {
            try
            {
                var result = await _service.UpdateExamAsync(id, dto);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpDelete("DeleteExam/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> DeleteExam(int id)
        {
            try
            {
                var result = await _service.DeleteExamAsync(id);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }


        #endregion



        #region Result Batch


        [HttpPost("CreateResultBatch")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> CreateResultBatch(
            CreateResultBatchDTO dto)
        {
            try
            {
                var result =
                    await _service.CreateResultBatchAsync(dto);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpGet("AllResultBatch")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> GetAllResultBatch()
        {
            try
            {
                var result =
                    await _service.GetAllResultBatchesAsync();


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpGet("ResultBatch/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> GetResultBatchById(int id)
        {
            try
            {
                var result =
                    await _service.GetResultBatchByIdAsync(id);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpPut("PublishResultBatch/{id:int}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<ActionResult<APIResponse>> PublishResultBatch(int id)
        {
            try
            {
                var result =
                    await _service.PublishResultBatchAsync(id);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }


        #endregion



        #region Result Upload


        [HttpPost("UploadStudentResult")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> UploadStudentResult(
            ResultUploadDTO dto)
        {
            try
            {
                var result =
                    await _service.UploadStudentResultAsync(dto);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.Created;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }



        [HttpPut("UpdateStudentResult")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> UpdateStudentResult(
            ResultUploadDTO dto)
        {
            try
            {
                var result =
                    await _service.UpdateStudentResultAsync(dto);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;


                return _apiResponse;
            }
        }


        #endregion



        #region Student Result



        [HttpGet("StudentResult/{resultBatchId}/{studentId}")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher,Student")]
        public async Task<ActionResult<APIResponse>> GetStudentResult(
            int resultBatchId,
            int studentId)
        {
            try
            {
                var result =
                    await _service.GetStudentResultAsync(
                        resultBatchId,
                        studentId);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);

            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpGet("BatchResult/{resultBatchId:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> GetBatchResult(
            int resultBatchId)
        {
            try
            {
                var result =
                    await _service.GetBatchResultsAsync(resultBatchId);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        [HttpGet("PreviousResult/{studentId:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Student")]
        public async Task<ActionResult<APIResponse>> PreviousResult(
            int studentId)
        {
            try
            {
                var result =
                    await _service.GetStudentPreviousResultsAsync(studentId);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }



        #endregion



        #region Result Detail


        [HttpGet("ResultDetails/{resultId:int}")]
        [Authorize(Roles = "SuperAdmin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> GetResultDetails(int resultId)
        {
            try
            {
                var result =
                    await _service.GetResultDetailsAsync(resultId);


                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode = HttpStatusCode.OK;


                return Ok(_apiResponse);
            }
            catch (Exception ex)
            {
                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode = HttpStatusCode.InternalServerError;

                return _apiResponse;
            }
        }


        #endregion

    }
}