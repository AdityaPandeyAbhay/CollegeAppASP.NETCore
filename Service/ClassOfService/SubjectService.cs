using AutoMapper;
using Data.Data;
using Model.Models.Subject_model;

using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class SubjectService : ISubjectService
    {
        private readonly ISubjectRepository _subjectRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public SubjectService(
            ISubjectRepository subjectRepository,
            IDepartmentRepository departmentRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _subjectRepository = subjectRepository;
            _departmentRepository = departmentRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<GetSubjectDTO> CreateSubjectAsync(CreateSubjectDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            // Check Department
            var department = await _departmentRepository.GetAsync(x => x.Id == dto.DepartmentId);

            if (department == null)
            {
                throw new Exception("Department not found.");
            }

            // Duplicate Subject Code
            var duplicateCode = await _subjectRepository.GetAllByFilterAsync(
                x => x.SubjectCode == dto.SubjectCode);

            if (duplicateCode.Any())
            {
                throw new Exception("Subject Code already exists.");
            }

            // Duplicate Subject Name
            var duplicateName = await _subjectRepository.GetAllByFilterAsync(
                x => x.DepartmentId == dto.DepartmentId &&
                     x.SubjectName.ToLower() == dto.SubjectName.ToLower());

            if (duplicateName.Any())
            {
                throw new Exception("Subject Name already exists in this Department.");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            var subject = _mapper.Map<Subject>(dto);

            subject.CreatedBy = currentUser;
            subject.CreatedDate = DateTime.UtcNow;
            subject.UpdatedBy = currentUser;
            subject.UpdatedDate = DateTime.UtcNow;

            await _subjectRepository.CreateAsync(subject);

            return _mapper.Map<GetSubjectDTO>(subject);
        }

        public async Task<List<GetSubjectDTO>> GetAllSubjectAsync()
        {
            var subjects = await _subjectRepository.GetAllAsync();

            return _mapper.Map<List<GetSubjectDTO>>(subjects);
        }

        public async Task<GetSubjectDTO> GetBySubjectCodeAsync(string code)
        {
            var subject = await _subjectRepository.GetAsync(
                x => x.SubjectCode == code,
                true);

            if (subject == null)
            {
                throw new Exception($"Subject '{code}' not found.");
            }

            return _mapper.Map<GetSubjectDTO>(subject);
        }

        public async Task<List<GetSubjectDTO>> GetSubjectByNameAsync(string name)
        {
            var subjects = await _subjectRepository.GetAllByFilterAsync(
                x => x.SubjectName.ToLower().Contains(name.ToLower()));

            return _mapper.Map<List<GetSubjectDTO>>(subjects);
        }

        public async Task<bool> UpdateSubjectAsync(int id, UpdateSubjectDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var subject = await _subjectRepository.GetAsync(x => x.Id == id);

            if (subject == null)
            {
                throw new Exception($"Subject not found with Id : {id}");
            }

            // Check Department
            var department = await _departmentRepository.GetAsync(x => x.Id == dto.DepartmentId);

            if (department == null)
            {
                throw new Exception("Department not found.");
            }

            // Duplicate Subject Code
            var duplicateCode = await _subjectRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.SubjectCode == dto.SubjectCode);

            if (duplicateCode.Any())
            {
                throw new Exception("Subject Code already exists.");
            }

            // Duplicate Subject Name
            var duplicateName = await _subjectRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.DepartmentId == dto.DepartmentId &&
                     x.SubjectName.ToLower() == dto.SubjectName.ToLower());

            if (duplicateName.Any())
            {
                throw new Exception("Subject Name already exists.");
            }

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            _mapper.Map(dto, subject);

            subject.UpdatedBy = currentUser;
            subject.UpdatedDate = DateTime.UtcNow;

            await _subjectRepository.UpdateAsync(subject);

            return true;
        }

        public async Task<bool> DeleteSubjectAsync(string code)
        {
            var subject = await _subjectRepository.GetAsync(
                x => x.SubjectCode == code,
                true);

            if (subject == null)
            {
                throw new Exception($"Subject '{code}' not found.");
            }

            await _subjectRepository.DeleteAsync(subject);

            return true;
        }
    }
}
