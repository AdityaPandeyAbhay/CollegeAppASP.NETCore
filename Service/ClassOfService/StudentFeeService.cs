using System;
using System.Collections.Generic;
using System.Text;

using AutoMapper;
using Data.Data;
using Model.Models.Fee_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;

namespace Service.ClassOfService
{
    public class StudentFeeService : IStudentFeeService
    {
        private readonly IStudentFeeRepository _studentFeeRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IFeeStructureRepository _feeStructureRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public StudentFeeService(
            IStudentFeeRepository studentFeeRepository,
            IStudentRepository studentRepository,
            IFeeStructureRepository feeStructureRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _studentFeeRepository = studentFeeRepository;
            _studentRepository = studentRepository;
            _feeStructureRepository = feeStructureRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<GetStudentFeeDTO> CreateStudentFeeAsync(CreateStudentFeeDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            // Validate Student
            var student = await _studentRepository.GetAsync(x => x.Id == dto.StudentId);

            if (student == null)
            {
                throw new Exception("Student not found.");
            }

            // Validate Fee Structure
            var feeStructure = await _feeStructureRepository.GetAsync(x => x.Id == dto.FeeStructureId);

            if (feeStructure == null)
            {
                throw new Exception("Fee Structure not found.");
            }

            // Prevent Duplicate Fee Assignment
            var duplicate = await _studentFeeRepository.GetAllByFilterAsync(x =>
                x.StudentId == dto.StudentId &&
                x.FeeStructureId == dto.FeeStructureId);

            if (duplicate.Any())
            {
                throw new Exception("Fee already assigned to this student.");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var studentFee = _mapper.Map<StudentFee>(dto);

            // Amount comes from FeeStructure
            studentFee.Amount = feeStructure.Amount;

            // Generate Invoice Number
            studentFee.InvoiceNo =
                $"INV-{DateTime.UtcNow:yyyyMMddHHmmssfff}";

            // Calculate Amounts
            studentFee.TotalAmount =
                studentFee.Amount - dto.Discount + dto.Fine;

            studentFee.BalanceAmount =
                studentFee.TotalAmount - dto.PaidAmount;

            // Calculate Status
            if (studentFee.BalanceAmount <= 0)
            {
                studentFee.Status = "Paid";
            }
            else if (studentFee.PaidAmount > 0)
            {
                studentFee.Status = "Partial";
            }
            else
            {
                studentFee.Status = "Pending";
            }

            studentFee.CreatedBy = currentUser;
            studentFee.CreatedDate = DateTime.UtcNow;

            studentFee.ModifiedBy = currentUser;
            studentFee.ModifiedDate = DateTime.UtcNow;

            await _studentFeeRepository.CreateAsync(studentFee);

            studentFee.Student = student;
            studentFee.FeeStructure = feeStructure;

            var result = _mapper.Map<GetStudentFeeDTO>(studentFee);
            result.StudentName = $"{student.FirstName} {(student.MiddleName ?? "")} {student.LastName}".Replace("  ", " ").Trim();
            return result;
        }



        public async Task<List<GetStudentFeeDTO>> GetAllStudentFeeAsync()
        {
            var studentFees = await _studentFeeRepository.GetAllAsync();
            var dtos = _mapper.Map<List<GetStudentFeeDTO>>(studentFees);

            var missingIds = dtos.Where(d => string.IsNullOrEmpty(d.StudentName)).Select(d => d.StudentId).Distinct().ToList();
            if (missingIds.Any())
            {
                var students = await _studentRepository.GetAllByFilterAsync(s => missingIds.Contains(s.Id));
                var studentMap = students.ToDictionary(
                    s => s.Id,
                    s => $"{s.FirstName} {(s.MiddleName ?? "")} {s.LastName}".Replace("  ", " ").Trim());

                foreach (var dto in dtos)
                {
                    if (string.IsNullOrEmpty(dto.StudentName) && studentMap.TryGetValue(dto.StudentId, out var sName))
                    {
                        dto.StudentName = sName;
                    }
                }
            }

            return dtos;
        }

        public async Task<GetStudentFeeDTO> GetStudentFeeByIdAsync(int id)
        {
            var studentFee = await _studentFeeRepository.GetAsync(
                x => x.Id == id,
                true);

            if (studentFee == null)
            {
                throw new Exception($"Student Fee not found with Id : {id}");
            }

            var dto = _mapper.Map<GetStudentFeeDTO>(studentFee);
            if (string.IsNullOrEmpty(dto.StudentName))
            {
                var student = await _studentRepository.GetAsync(s => s.Id == studentFee.StudentId);
                if (student != null)
                {
                    dto.StudentName = $"{student.FirstName} {(student.MiddleName ?? "")} {student.LastName}".Replace("  ", " ").Trim();
                }
            }

            return dto;
        }

        public async Task<List<GetStudentFeeDTO>> GetStudentFeeByStudentAsync(int studentId)
        {
            var studentFees = await _studentFeeRepository.GetAllByFilterAsync(
                x => x.StudentId == studentId);

            var dtos = _mapper.Map<List<GetStudentFeeDTO>>(studentFees);
            var student = await _studentRepository.GetAsync(s => s.Id == studentId);
            if (student != null)
            {
                var sName = $"{student.FirstName} {(student.MiddleName ?? "")} {student.LastName}".Replace("  ", " ").Trim();
                foreach (var dto in dtos)
                {
                    if (string.IsNullOrEmpty(dto.StudentName))
                    {
                        dto.StudentName = sName;
                    }
                }
            }

            return dtos;
        }

        public async Task<bool> UpdateStudentFeeAsync(int id, UpdateStudentFeeDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var studentFee = await _studentFeeRepository.GetAsync(x => x.Id == id);

            if (studentFee == null)
            {
                throw new Exception($"Student Fee not found with Id : {id}");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // Amount should always come from FeeStructure
            var feeStructure = await _feeStructureRepository.GetAsync(
                x => x.Id == studentFee.FeeStructureId);

            if (feeStructure == null)
            {
                throw new Exception("Fee Structure not found.");
            }

            studentFee.Amount = feeStructure.Amount;

            studentFee.Discount = dto.Discount;
            studentFee.Fine = dto.Fine;
            studentFee.PaidAmount = dto.PaidAmount;
            studentFee.DueDate = dto.DueDate;

            // Calculate Total Amount
            studentFee.TotalAmount =
                studentFee.Amount - studentFee.Discount + studentFee.Fine;

            // Calculate Balance
            studentFee.BalanceAmount =
                studentFee.TotalAmount - studentFee.PaidAmount;

            // Payment Status
            if (studentFee.BalanceAmount <= 0)
            {
                studentFee.Status = "Paid";
            }
            else if (studentFee.PaidAmount > 0)
            {
                studentFee.Status = "Partial";
            }
            else
            {
                studentFee.Status = "Pending";
            }

            studentFee.ModifiedBy = currentUser;
            studentFee.ModifiedDate = DateTime.UtcNow;

            await _studentFeeRepository.UpdateAsync(studentFee);

            return true;
        }


        public async Task<List<GetStudentFeeDTO>> GetStudentFeeByStudentNameAsync(string studentName)
        {
            if (string.IsNullOrWhiteSpace(studentName))
            {
                throw new ArgumentException("Student name is required.");
            }

            var studentFees = await _studentFeeRepository.GetAllByFilterAsync(x =>

                x.Student.FirstName.ToLower().Contains(studentName.ToLower()) ||

                (x.Student.MiddleName != null &&
                 x.Student.MiddleName.ToLower().Contains(studentName.ToLower())) ||

                x.Student.LastName.ToLower().Contains(studentName.ToLower()) ||

                (x.Student.FirstName + " " + x.Student.LastName)
                    .ToLower()
                    .Contains(studentName.ToLower()) ||

                (x.Student.FirstName + " " +
                 (x.Student.MiddleName ?? "") + " " +
                 x.Student.LastName)
                    .ToLower()
                    .Contains(studentName.ToLower())
            );

            var dtos = _mapper.Map<List<GetStudentFeeDTO>>(studentFees);
            var studentIds = dtos.Select(d => d.StudentId).Distinct().ToList();
            if (studentIds.Any())
            {
                var students = await _studentRepository.GetAllByFilterAsync(s => studentIds.Contains(s.Id));
                var studentMap = students.ToDictionary(
                    s => s.Id,
                    s => $"{s.FirstName} {(s.MiddleName ?? "")} {s.LastName}".Replace("  ", " ").Trim());

                foreach (var dto in dtos)
                {
                    if (studentMap.TryGetValue(dto.StudentId, out var sName))
                    {
                        dto.StudentName = sName;
                    }
                }
            }

            return dtos;
        }


        public async Task<bool> DeleteStudentFeeAsync(int id)
        {
            var studentFee = await _studentFeeRepository.GetAsync(
                x => x.Id == id,
                true);

            if (studentFee == null)
            {
                throw new Exception($"Student Fee not found with Id : {id}");
            }

            await _studentFeeRepository.DeleteAsync(studentFee);

            return true;
        }


        public async Task<List<StudentFeeDropdownDTO>> GetStudentFeeDropdownAsync()
        {
            var studentFees = await _studentFeeRepository.GetAllByFilterAsync(x => true);
            var students = await _studentRepository.GetAllAsync();
            var studentMap = students.ToDictionary(
                s => s.Id,
                s => $"{s.FirstName} {(s.MiddleName ?? "")} {s.LastName}".Replace("  ", " ").Trim());

            return studentFees.Select(x =>
            {
                studentMap.TryGetValue(x.StudentId, out var sName);
                return new StudentFeeDropdownDTO
                {
                    Id = x.Id,
                    DisplayName = $"{x.InvoiceNo} - {(sName ?? $"Student #{x.StudentId}")}"
                };
            }).ToList();
        }
    }
}