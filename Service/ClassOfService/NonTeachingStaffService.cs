using AutoMapper;
using Data.Data;
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



        public async Task<GetNonTeachingStaffDTO> CreateNonTeachingStaffAsync(CreateNonTeachingStaffDTO dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }
            var user = await _userRepository.GetAllByFilterAsync(u => u.Id == dto.UserId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            var isExist = await _nonTeachingStaffRepository.GetAllByFilterAsync(u =>u.UserId == dto.UserId);
            if (isExist != null)
            {
                throw new Exception("Teacher already exists for this User.");
            }
            // current loggin user 
            var currentUserId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUserId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var staff = _mapper.Map<NonTeachingStaff>(dto);
            staff.CreatedBy = currentUserId;
            staff.CreatedDate = DateTime.UtcNow;
            staff.UpdatedDate = DateTime.UtcNow;
            staff.UpdatedBy = currentUserId;

            await _nonTeachingStaffRepository.CreateAsync(staff);


            return _mapper.Map<GetNonTeachingStaffDTO>(staff);

        }


        public async Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffAsync()
        {
            var staff = await _nonTeachingStaffRepository.GetAllAsync();
            return _mapper.Map<List<GetNonTeachingStaffDTO>>(staff);

        }


        public async Task<GetNonTeachingStaffDTO> GetNonTeachingStaffByCodeAsync(string code)
        {
            var staff = await _nonTeachingStaffRepository.GetAllByFilterAsync(u => u.StaffCode == code);

            return _mapper.Map<GetNonTeachingStaffDTO>(staff);

        }

        public async Task<List<GetNonTeachingStaffDTO>> GetNonTeachingStaffByNameAsync(string name)
        {
            var staff = await _nonTeachingStaffRepository.GetAllByFilterAsync(x =>
                x.FirstName.ToLower().Contains(name.ToLower()) ||

                (x.MiddleName != null &&
                 x.MiddleName.ToLower().Contains(name.ToLower())) ||

                x.LastName.ToLower().Contains(name.ToLower()) ||

                (x.FirstName + " " + x.LastName)
                    .ToLower()
                    .Contains(name.ToLower()) ||

                (x.FirstName + " " +
                 (x.MiddleName ?? "") + " " +
                 x.LastName)
                    .ToLower()
                    .Contains(name.ToLower())
            );

            return _mapper.Map<List<GetNonTeachingStaffDTO>>(staff) ;
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
