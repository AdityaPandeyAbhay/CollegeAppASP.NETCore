using AutoMapper;
using CollegeApp.Data;
using Data.Data;
using Microsoft.EntityFrameworkCore;
using Model.Models;
using Model.Models.NonTeachingStaff;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service.ClassOfService
{
    public class NonTeachingStaffService : INonTeachingStaffService
    {
        private readonly INonTeachingStaffRepository _nonTeachingStaffRepository;
        private readonly IMapper _mapper;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserServices _currentUserService;
        private readonly CollegeDBContext _dbContext;

        public NonTeachingStaffService(
            INonTeachingStaffRepository nonTeachingStaffRepository,
            IUserRepository userRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService,
            CollegeDBContext dbContext)
        {
            _currentUserService = currentUserService;
            _mapper = mapper;
            _nonTeachingStaffRepository = nonTeachingStaffRepository;
            _userRepository = userRepository;
            _dbContext = dbContext;
        }

        // =====================================================
        // CREATE NON-TEACHING STAFF
        // =====================================================
        public async Task<GetNonTeachingStaffDTO> CreateNonTeachingStaffAsync(CreateNonTeachingStaffDTO dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            // 1. Check User Exists
            var users = await _userRepository.GetAllByFilterAsync(u => u.Id == dto.UserId);
            if (users == null || !users.Any())
            {
                throw new Exception($"User with Id '{dto.UserId}' not found.");
            }

            // 2. Check Staff already exists for User
            var existingStaff = await _nonTeachingStaffRepository.GetAllByFilterAsync(x => x.UserId == dto.UserId);
            if (existingStaff != null && existingStaff.Any())
            {
                throw new Exception($"Non-Teaching Staff already exists for User '{dto.UserId}'.");
            }

            // 2b. Check Staff Code Unique
            if (string.IsNullOrWhiteSpace(dto.StaffCode))
            {
                throw new ArgumentException("Staff Code is required.");
            }

            var cleanStaffCode = dto.StaffCode.Trim();
            var existingStaffByCode = await _nonTeachingStaffRepository.GetAllByFilterAsync(x => x.StaffCode == cleanStaffCode);
            if (existingStaffByCode != null && existingStaffByCode.Any())
            {
                throw new Exception($"Staff Code '{cleanStaffCode}' is already in use. Please use a unique Staff Code.");
            }

            // 3. Current User
            var currentUserId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUserId))
            {
                currentUserId = dto.UserId;
            }

            // 4. Map DTO to Entity
            var staff = _mapper.Map<NonTeachingStaff>(dto);
            staff.StaffCode = cleanStaffCode;
            staff.FirstName = dto.FirstName?.Trim() ?? string.Empty;
            staff.MiddleName = dto.MiddleName?.Trim() ?? string.Empty;
            staff.LastName = dto.LastName?.Trim() ?? string.Empty;
            staff.Gender = dto.Gender?.Trim() ?? string.Empty;
            staff.Email = dto.Email?.Trim() ?? string.Empty;
            staff.PhoneNumber = dto.PhoneNumber?.Trim() ?? string.Empty;
            staff.AlternatePhoneNumber = dto.AlternatePhoneNumber?.Trim() ?? string.Empty;
            staff.Address = dto.Address?.Trim() ?? string.Empty;
            staff.Designation = dto.Designation?.Trim() ?? string.Empty;
            staff.Qualification = dto.Qualification?.Trim() ?? string.Empty;
            staff.FatherName = string.IsNullOrWhiteSpace(dto.FatherName) ? null : dto.FatherName.Trim();
            staff.MotherName = string.IsNullOrWhiteSpace(dto.MotherName) ? null : dto.MotherName.Trim();
            staff.Photo = string.IsNullOrWhiteSpace(dto.Photo) ? null : dto.Photo.Trim();
            staff.EducationPdf = string.IsNullOrWhiteSpace(dto.EducationPdf) ? null : dto.EducationPdf.Trim();
            staff.EducationFileName = string.IsNullOrWhiteSpace(dto.EducationFileName) ? null : dto.EducationFileName.Trim();
            staff.Salary = dto.Salary;
            staff.DateOfBirth = dto.DateOfBirth;
            staff.JoiningDate = dto.JoiningDate;
            staff.IsActive = true;

            // 5. Audit
            staff.CreatedBy = currentUserId;
            staff.CreatedDate = DateTime.UtcNow;
            staff.UpdatedBy = currentUserId;
            staff.UpdatedDate = DateTime.UtcNow;

            try
            {
                await _nonTeachingStaffRepository.CreateAsync(staff);
            }
            catch (Exception dbEx)
            {
                var innerMsg = dbEx.InnerException?.InnerException?.Message
                    ?? dbEx.InnerException?.Message
                    ?? dbEx.Message;

                if (innerMsg.Contains("IX_NonTeachingStaffs_StaffCode") || innerMsg.Contains("StaffCode"))
                {
                    throw new Exception($"Staff Code '{cleanStaffCode}' already exists in database.");
                }
                if (innerMsg.Contains("IX_NonTeachingStaffs_UserId") || innerMsg.Contains("UserId"))
                {
                    throw new Exception($"User '{dto.UserId}' is already assigned to a Staff Profile in database.");
                }
                throw new Exception($"Failed to save Staff record: {innerMsg}");
            }

            // Eager load User -> UserRoleMappings -> Role for full DTO return
            var createdWithRoles = await _dbContext.NonTeachingStaffs
                .AsNoTracking()
                .Include(s => s.User)
                    .ThenInclude(u => u.UserRoleMappings)
                        .ThenInclude(urm => urm.Role)
                .FirstOrDefaultAsync(s => s.Id == staff.Id);

            return _mapper.Map<GetNonTeachingStaffDTO>(createdWithRoles ?? staff);
        }

        // =====================================================
        // GET ALL NON-TEACHING STAFF (With Roles)
        // =====================================================
        public async Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffAsync()
        {
            var staffList = await _dbContext.NonTeachingStaffs
                .AsNoTracking()
                .Include(s => s.User)
                    .ThenInclude(u => u.UserRoleMappings)
                        .ThenInclude(urm => urm.Role)
                .ToListAsync();

            return _mapper.Map<List<GetNonTeachingStaffDTO>>(staffList);
        }

        // =====================================================
        // GET BY STAFF CODE (With Roles)
        // =====================================================
        public async Task<GetNonTeachingStaffDTO> GetNonTeachingStaffByCodeAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ArgumentException("Staff code is required.");
            }

            var clean = code.Trim();
            var staff = await _dbContext.NonTeachingStaffs
                .AsNoTracking()
                .Include(s => s.User)
                    .ThenInclude(u => u.UserRoleMappings)
                        .ThenInclude(urm => urm.Role)
                .FirstOrDefaultAsync(x => x.StaffCode.ToLower() == clean.ToLower());

            if (staff == null)
            {
                throw new KeyNotFoundException($"Staff with code '{clean}' not found.");
            }

            return _mapper.Map<GetNonTeachingStaffDTO>(staff);
        }

        // =====================================================
        // GET BY STAFF NAME (With Roles)
        // =====================================================
        public async Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffByNameAsync(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name is required.");
            }

            var searchName = name.Trim().ToLower();

            var staff = await _dbContext.NonTeachingStaffs
                .AsNoTracking()
                .Include(s => s.User)
                    .ThenInclude(u => u.UserRoleMappings)
                        .ThenInclude(urm => urm.Role)
                .Where(x =>
                    x.FirstName.ToLower().Contains(searchName)
                    || x.LastName.ToLower().Contains(searchName)
                    || (x.MiddleName != null && x.MiddleName.ToLower().Contains(searchName))
                    || ((x.FirstName + " " + x.LastName).ToLower().Contains(searchName))
                    || ((x.FirstName + " " + (x.MiddleName ?? "") + " " + x.LastName).ToLower().Contains(searchName))
                    || x.StaffCode.ToLower().Contains(searchName)
                )
                .ToListAsync();

            if (staff == null || !staff.Any())
            {
                return new List<GetNonTeachingStaffDTO>();
            }

            return _mapper.Map<List<GetNonTeachingStaffDTO>>(staff);
        }

        // =====================================================
        // GET NON-TEACHING STAFF DROPDOWN
        // =====================================================
        public async Task<List<DropdownDTO>> GetNonTeachingStaffDropdownAsync()
        {
            var staff = await _nonTeachingStaffRepository.GetAllByFilterAsync(x => x.IsActive);

            if (staff == null || !staff.Any())
            {
                return new List<DropdownDTO>();
            }

            return staff
                .Select(x => new DropdownDTO
                {
                    Id = x.Id,
                    Code = x.StaffCode,
                    Text = $"{x.FirstName} " +
                           $"{(string.IsNullOrWhiteSpace(x.MiddleName) ? "" : x.MiddleName + " ")}" +
                           $"{x.LastName}".Trim()
                })
                .ToList();
        }

        // =====================================================
        // UPDATE NON-TEACHING STAFF (BY ID)
        // =====================================================
        public async Task<bool> UpdateNonTeachingStaffAsync(int id, UpdateNonTeachingStaffDTO dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            var staff = await _nonTeachingStaffRepository.GetAsync(u => u.Id == id);
            if (staff == null)
            {
                throw new KeyNotFoundException($"Staff not found with StaffId: {id}");
            }

            var currentUserId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUserId))
            {
                currentUserId = staff.UserId;
            }

            _mapper.Map(dto, staff);

            staff.FirstName = dto.FirstName?.Trim() ?? staff.FirstName;
            staff.MiddleName = dto.MiddleName?.Trim() ?? string.Empty;
            staff.LastName = dto.LastName?.Trim() ?? staff.LastName;
            staff.Gender = dto.Gender?.Trim() ?? staff.Gender;
            staff.Email = dto.Email?.Trim() ?? staff.Email;
            staff.PhoneNumber = dto.PhoneNumber?.Trim() ?? staff.PhoneNumber;
            staff.AlternatePhoneNumber = dto.AlternatePhoneNumber?.Trim() ?? string.Empty;
            staff.Address = dto.Address?.Trim() ?? string.Empty;
            staff.Designation = dto.Designation?.Trim() ?? staff.Designation;
            staff.Qualification = dto.Qualification?.Trim() ?? string.Empty;

            // Updated columns (FatherName, MotherName, Photo, EducationPdf, EducationFileName)
            staff.FatherName = string.IsNullOrWhiteSpace(dto.FatherName) ? null : dto.FatherName.Trim();
            staff.MotherName = string.IsNullOrWhiteSpace(dto.MotherName) ? null : dto.MotherName.Trim();
            if (dto.Photo != null)
            {
                staff.Photo = string.IsNullOrWhiteSpace(dto.Photo) ? null : dto.Photo.Trim();
            }
            if (dto.EducationPdf != null)
            {
                staff.EducationPdf = string.IsNullOrWhiteSpace(dto.EducationPdf) ? null : dto.EducationPdf.Trim();
            }
            if (dto.EducationFileName != null)
            {
                staff.EducationFileName = string.IsNullOrWhiteSpace(dto.EducationFileName) ? null : dto.EducationFileName.Trim();
            }

            staff.Salary = dto.Salary;
            staff.DateOfBirth = dto.DateOfBirth;
            staff.JoiningDate = dto.JoiningDate;
            staff.IsActive = dto.IsActive;

            staff.UpdatedDate = DateTime.UtcNow;
            staff.UpdatedBy = currentUserId;

            try
            {
                await _nonTeachingStaffRepository.UpdateAsync(staff);
            }
            catch (Exception dbEx)
            {
                var innerMsg = dbEx.InnerException?.InnerException?.Message
                    ?? dbEx.InnerException?.Message
                    ?? dbEx.Message;
                throw new Exception($"Failed to update Staff record: {innerMsg}");
            }

            return true;
        }

        // =====================================================
        // UPDATE NON-TEACHING STAFF (BY CODE)
        // =====================================================
        public async Task<bool> UpdateNonTeachingStaffByCodeAsync(string code, UpdateNonTeachingStaffDTO dto)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ArgumentException("Staff code is required.");
            }
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            var cleanCode = code.Trim();
            var staff = await _nonTeachingStaffRepository.GetAsync(u => u.StaffCode == cleanCode);
            if (staff == null)
            {
                throw new KeyNotFoundException($"Staff not found with Staff Code: {cleanCode}");
            }

            var currentUserId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(currentUserId))
            {
                currentUserId = staff.UserId;
            }

            _mapper.Map(dto, staff);

            staff.FirstName = dto.FirstName?.Trim() ?? staff.FirstName;
            staff.MiddleName = dto.MiddleName?.Trim() ?? string.Empty;
            staff.LastName = dto.LastName?.Trim() ?? staff.LastName;
            staff.Gender = dto.Gender?.Trim() ?? staff.Gender;
            staff.Email = dto.Email?.Trim() ?? staff.Email;
            staff.PhoneNumber = dto.PhoneNumber?.Trim() ?? staff.PhoneNumber;
            staff.AlternatePhoneNumber = dto.AlternatePhoneNumber?.Trim() ?? string.Empty;
            staff.Address = dto.Address?.Trim() ?? string.Empty;
            staff.Designation = dto.Designation?.Trim() ?? staff.Designation;
            staff.Qualification = dto.Qualification?.Trim() ?? string.Empty;

            // Updated columns (FatherName, MotherName, Photo, EducationPdf, EducationFileName)
            staff.FatherName = string.IsNullOrWhiteSpace(dto.FatherName) ? null : dto.FatherName.Trim();
            staff.MotherName = string.IsNullOrWhiteSpace(dto.MotherName) ? null : dto.MotherName.Trim();
            if (dto.Photo != null)
            {
                staff.Photo = string.IsNullOrWhiteSpace(dto.Photo) ? null : dto.Photo.Trim();
            }
            if (dto.EducationPdf != null)
            {
                staff.EducationPdf = string.IsNullOrWhiteSpace(dto.EducationPdf) ? null : dto.EducationPdf.Trim();
            }
            if (dto.EducationFileName != null)
            {
                staff.EducationFileName = string.IsNullOrWhiteSpace(dto.EducationFileName) ? null : dto.EducationFileName.Trim();
            }

            staff.Salary = dto.Salary;
            staff.DateOfBirth = dto.DateOfBirth;
            staff.JoiningDate = dto.JoiningDate;
            staff.IsActive = dto.IsActive;

            staff.UpdatedDate = DateTime.UtcNow;
            staff.UpdatedBy = currentUserId;

            try
            {
                await _nonTeachingStaffRepository.UpdateAsync(staff);
            }
            catch (Exception dbEx)
            {
                var innerMsg = dbEx.InnerException?.InnerException?.Message
                    ?? dbEx.InnerException?.Message
                    ?? dbEx.Message;
                throw new Exception($"Failed to update Staff record: {innerMsg}");
            }

            return true;
        }

        // =====================================================
        // DELETE NON-TEACHING STAFF
        // =====================================================
        public async Task<bool> DeleteNonTeachingStaffAsync(string codeOrId)
        {
            if (string.IsNullOrWhiteSpace(codeOrId))
            {
                throw new ArgumentException("Staff code or ID is required.");
            }

            var clean = codeOrId.Trim();
            NonTeachingStaff? staff = null;

            if (int.TryParse(clean, out int id))
            {
                staff = await _nonTeachingStaffRepository.GetAsync(u => u.Id == id || u.StaffCode == clean);
            }
            else
            {
                staff = await _nonTeachingStaffRepository.GetAsync(u => u.StaffCode == clean);
            }

            if (staff == null)
            {
                throw new KeyNotFoundException($"Non-Teaching Staff with identifier '{clean}' does not exist.");
            }

            await _nonTeachingStaffRepository.DeleteAsync(staff);
            return true;
        }
    }
}
