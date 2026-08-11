using AutoMapper;
using Data.Data;
using Model.Models;
using Model.Models.NonTeachingStaff;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class NonTeachingStaffService : INonTeachingStaffService
    {
        private readonly INonTeachingStaffRepository _nonTeachingStaffRepository;
        private IMapper _mapper;
        private readonly IUserRepository _userRepository;
        private readonly ICurrentUserServices _currentUserService;
        public NonTeachingStaffService(INonTeachingStaffRepository nonTeachingStaffRepository, IUserRepository userRepository, IMapper mapper, ICurrentUserServices currentUserService)
        {
           _currentUserService = currentUserService;
            _mapper = mapper;
            _nonTeachingStaffRepository = nonTeachingStaffRepository;
            _userRepository = userRepository;
        }



       
public async Task<GetNonTeachingStaffDTO> CreateNonTeachingStaffAsync(
    CreateNonTeachingStaffDTO dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            // =====================================================
            // 1. CHECK USER EXISTS
            // =====================================================

            var users = await _userRepository.GetAllByFilterAsync(
                u => u.Id == dto.UserId
            );

            if (users == null || !users.Any())
            {
                throw new Exception(
                    $"User with Id '{dto.UserId}' not found."
                );
            }

            // =====================================================
            // 2. CHECK NON-TEACHING STAFF ALREADY EXISTS
            // =====================================================

            var existingStaff =
                await _nonTeachingStaffRepository.GetAllByFilterAsync(
                    x => x.UserId == dto.UserId
                );

            if (existingStaff != null && existingStaff.Any())
            {
                throw new Exception(
                    $"Non-Teaching Staff already exists for User '{dto.UserId}'."
                );
            }

            // =====================================================
            // 3. GET CURRENT LOGGED-IN USER
            // =====================================================

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException(
                    "User is not authenticated."
                );
            }

            // =====================================================
            // 4. MAP DTO TO ENTITY
            // =====================================================

            var staff = _mapper.Map<NonTeachingStaff>(dto);

            // =====================================================
            // 5. AUDIT FIELDS
            // =====================================================

            staff.CreatedBy = currentUserId;
            staff.CreatedDate = DateTime.UtcNow;
            staff.UpdatedBy = currentUserId;
            staff.UpdatedDate = DateTime.UtcNow;

            // =====================================================
            // 6. CREATE NON-TEACHING STAFF
            // =====================================================

            await _nonTeachingStaffRepository.CreateAsync(staff);

            // =====================================================
            // 7. RETURN CREATED STAFF
            // =====================================================

            return _mapper.Map<GetNonTeachingStaffDTO>(staff);
        }




        public async Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffAsync()
        {
            var staff = await _nonTeachingStaffRepository.GetAllAsync();
            return _mapper.Map<List<GetNonTeachingStaffDTO>>(staff);

        }

        // =====================================================
        // GET BY STAFF CODE
        // =====================================================
        public async Task<GetNonTeachingStaffDTO> GetNonTeachingStaffByCodeAsync(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ArgumentException("Staff code is required.");
            }

            code = code.Trim();

            var staff = await _nonTeachingStaffRepository.GetAsync(
                x => x.StaffCode == code
            );

            if (staff == null)
            {
                throw new KeyNotFoundException(
                    $"Staff with code '{code}' not found."
                );
            }

            return _mapper.Map<GetNonTeachingStaffDTO>(staff);
        }


        // =====================================================
        // GET BY STAFF NAME
        // =====================================================
        public async Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffByNameAsync(
            string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException("Name is required.");
            }

            var searchName = name.Trim().ToLower();

            var staff = await _nonTeachingStaffRepository.GetAllByFilterAsync(x =>
                x.FirstName.ToLower().Contains(searchName)

                || x.LastName.ToLower().Contains(searchName)

                || (
                    x.MiddleName != null &&
                    x.MiddleName.ToLower().Contains(searchName)
                )

                || (
                    (x.FirstName + " " + x.LastName)
                        .ToLower()
                        .Contains(searchName)
                )

                || (
                    (x.FirstName + " " +
                     (x.MiddleName ?? "") + " " +
                     x.LastName)
                        .ToLower()
                        .Contains(searchName)
                )
            );

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
            var staff = await _nonTeachingStaffRepository.GetAllByFilterAsync(
                x => x.IsActive
            );

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



        public async Task<bool> UpdateNonTeachingStaffAsync(int id,UpdateNonTeachingStaffDTO dto)
        {
            var user = await _nonTeachingStaffRepository.GetAsync(u => u.Id == id);
            if (user == null)
            {
                throw new Exception($"Staff not found with StaffId : {id}");
            }

            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            _mapper.Map(dto , user);

            user.UpdatedDate = DateTime.Now;
            user.UpdatedBy = currentUserId;

            await _nonTeachingStaffRepository.UpdateAsync(user);

            return true;


        }

        public async Task<bool> DeleteNonTeachingStaffAsync(string code)
        {
            var staff = await _nonTeachingStaffRepository.GetAsync(u => u.StaffCode == code);
            if (staff == null)
            {
                throw new UnauthorizedAccessException($" Teacher {code} not  Exist");
            }

            await _nonTeachingStaffRepository.DeleteAsync(staff);
            return true;

        }
       

    }
}
