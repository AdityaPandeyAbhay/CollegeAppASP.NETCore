using CollegeApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Model.Models.Attendance_Model;
using Service.InterfaceOfService;
using System.Net;

namespace CollegeApp.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class AttendanceController : ControllerBase
    {

        private readonly IAttendanceService _service;
        private readonly APIResponse _apiResponse;
        private readonly ILogger<AttendanceController> _logger;



        public AttendanceController(
            IAttendanceService service,
            ILogger<AttendanceController> logger)
        {
            _service = service;
            _logger = logger;
            _apiResponse = new APIResponse();
        }




        //=========================================================
        // CREATE / TAKE ATTENDANCE
        //=========================================================


        [HttpPost("TakeAttendance")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> TakeAttendance(
            TakeAttendanceDTO dto)
        {

            try
            {

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);



                var result =
                    await _service.TakeAttendanceAsync(dto);



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.Created;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _logger.LogError(ex, ex.Message);


                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;

            }

        }






        //=========================================================
        // GET ALL ATTENDANCE
        //=========================================================


        [HttpGet("AllAttendance")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        public async Task<ActionResult<APIResponse>> GetAllAttendance()
        {

            try
            {

                var result =
                    await _service.GetAllAttendanceAsync();



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;

            }

        }






        //=========================================================
        // GET ATTENDANCE BY ID
        //=========================================================


        [HttpGet("{id:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        public async Task<ActionResult<APIResponse>> GetAttendanceById(
            int id)
        {

            try
            {

                var result =
                    await _service.GetAttendanceByIdAsync(id);



                if (result == null)
                    return NotFound();



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;

            }

        }







        //=========================================================
        // GET ATTENDANCE BY DATE
        //=========================================================


        [HttpGet("ByDate")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        public async Task<ActionResult<APIResponse>> GetAttendanceByDate(
            int teacherAssignmentId,
            DateOnly attendanceDate)
        {

            try
            {

                var result =
                    await _service.GetAttendanceAsync(
                        teacherAssignmentId,
                        attendanceDate);



                if (result == null)
                    return NotFound();



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;



                return _apiResponse;

            }

        }






        //=========================================================
        // GET TEACHER ATTENDANCE
        //=========================================================


        [HttpGet("Teacher/{teacherId:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        public async Task<ActionResult<APIResponse>> GetTeacherAttendance(
            int teacherId)
        {

            try
            {

                var result =
                    await _service.GetTeacherAttendanceAsync(
                        teacherId);



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;

            }

        }







        //=========================================================
        // UPDATE ATTENDANCE
        //=========================================================


        [HttpPut("UpdateAttendance")]
        [Authorize(Roles = "Super Admin,Admin,Teacher")]
        public async Task<ActionResult<APIResponse>> UpdateAttendance(
            UpdateAttendanceDTO dto)
        {

            try
            {

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);



                var result =
                    await _service.UpdateAttendanceAsync(dto);



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;

            }

        }






        //=========================================================
        // DELETE ATTENDANCE
        //=========================================================


        [HttpDelete("DeleteAttendance/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
        public async Task<ActionResult<APIResponse>> DeleteAttendance(
            int id)
        {

            try
            {

                var result =
                    await _service.DeleteAttendanceAsync(id);



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;



                return _apiResponse;

            }

        }







        //=========================================================
        // GET ATTENDANCE DETAILS
        //=========================================================


        [HttpGet("Details/{attendanceId:int}")]
        [Authorize(Roles = "Super Admin,Admin,Teacher,Operator")]
        public async Task<ActionResult<APIResponse>> GetAttendanceDetails(
            int attendanceId)
        {

            try
            {

                var result =
                    await _service.GetAttendanceDetailsAsync(
                        attendanceId);



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;



                return _apiResponse;

            }

        }







        //=========================================================
        // DELETE ATTENDANCE DETAIL
        //=========================================================


        [HttpDelete("DeleteDetail/{id:int}")]
        [Authorize(Roles = "Super Admin,Admin")]
        public async Task<ActionResult<APIResponse>> DeleteAttendanceDetail(
            int id)
        {

            try
            {

                var result =
                    await _service.DeleteAttendanceDetailAsync(id);



                _apiResponse.Data = result;
                _apiResponse.Status = true;
                _apiResponse.StatusCode =
                    HttpStatusCode.OK;



                return Ok(_apiResponse);


            }
            catch (Exception ex)
            {

                _apiResponse.Status = false;
                _apiResponse.Errors.Add(ex.Message);
                _apiResponse.StatusCode =
                    HttpStatusCode.InternalServerError;


                return _apiResponse;

            }

        }



    }

}