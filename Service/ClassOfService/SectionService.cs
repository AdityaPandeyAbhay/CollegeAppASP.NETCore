using AutoMapper;
using Data.Data;
using Model.Models;
using Model.Models.Class_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;

namespace Service.ClassOfService
{
    public class SectionService : ISectionService
    {
        private readonly ISectionRepository _sectionRepository;
        private readonly ISchoolClassRepository _classRepository;
        private readonly IMapper _mapper;
        private readonly ICurrentUserServices _currentUserService;

        public SectionService(
            ISectionRepository sectionRepository,
            ISchoolClassRepository classRepository,
            IMapper mapper,
            ICurrentUserServices currentUserService)
        {
            _sectionRepository = sectionRepository;
            _classRepository = classRepository;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        #region Create Section

        public async Task<GetSectionDTO> CreateSectionAsync(CreateSectionDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var schoolClass = await _classRepository.GetAsync(x => x.Id == dto.SchoolClassId);

            if (schoolClass == null)
                throw new Exception("Class not found.");

            var duplicateCode = await _sectionRepository.GetAllByFilterAsync(
                x => x.SectionCode == dto.SectionCode);

            if (duplicateCode.Any())
                throw new Exception("Section Code already exists.");

            var duplicateName = await _sectionRepository.GetAllByFilterAsync(
                x => x.SchoolClassId == dto.SchoolClassId &&
                     x.SectionName.ToLower() == dto.SectionName.ToLower());

            if (duplicateName.Any())
                throw new Exception("Section Name already exists in this Class.");

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
                throw new UnauthorizedAccessException("User is not authenticated.");

            var section = _mapper.Map<Section>(dto);

            section.CreatedBy = currentUser;
            section.CreatedDate = DateTime.UtcNow;
            section.UpdatedBy = currentUser;
            section.UpdatedDate = DateTime.UtcNow;

            await _sectionRepository.CreateAsync(section);

            return _mapper.Map<GetSectionDTO>(section);
        }

        #endregion

        #region Get All

        public async Task<List<GetSectionDTO>> GetAllSectionAsync()
        {
            var sections = await _sectionRepository.GetAllAsync();

            sections = sections
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.SectionName)
                .ToList();

            return _mapper.Map<List<GetSectionDTO>>(sections);
        }

        #endregion

        #region Get By Code

        public async Task<GetSectionDTO> GetBySectionCodeAsync(string code)
        {
            var section = await _sectionRepository.GetAsync(
                x => x.SectionCode == code,
                true);

            if (section == null)
                throw new Exception($"Section '{code}' not found.");

            return _mapper.Map<GetSectionDTO>(section);
        }

        #endregion

        #region Get By Name

        public async Task<List<GetSectionDTO>> GetSectionByNameAsync(string name)
        {
            var sections = await _sectionRepository.GetAllByFilterAsync(
                x => x.SectionName.ToLower().Contains(name.ToLower()));

            sections = sections
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.SectionName)
                .ToList();

            return _mapper.Map<List<GetSectionDTO>>(sections);
        }

        #endregion

        #region Update

        public async Task<bool> UpdateSectionAsync(int id, UpdateSectionDTO dto)
        {
            ArgumentNullException.ThrowIfNull(dto);

            var section = await _sectionRepository.GetAsync(x => x.Id == id);

            if (section == null)
                throw new Exception($"Section not found with Id : {id}");

            var schoolClass = await _classRepository.GetAsync(
                x => x.Id == dto.SchoolClassId);

            if (schoolClass == null)
                throw new Exception("Class not found.");

            var duplicateCode = await _sectionRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.SectionCode == dto.SectionCode);

            if (duplicateCode.Any())
                throw new Exception("Section Code already exists.");

            var duplicateName = await _sectionRepository.GetAllByFilterAsync(
                x => x.Id != id &&
                     x.SchoolClassId == dto.SchoolClassId &&
                     x.SectionName.ToLower() == dto.SectionName.ToLower());

            if (duplicateName.Any())
                throw new Exception("Section Name already exists.");

            var currentUser = _currentUserService.UserId;

            if (string.IsNullOrEmpty(currentUser))
                throw new UnauthorizedAccessException("User is not authenticated.");

            _mapper.Map(dto, section);

            section.UpdatedBy = currentUser;
            section.UpdatedDate = DateTime.UtcNow;

            await _sectionRepository.UpdateAsync(section);

            return true;
        }

        #endregion

        #region Delete

        public async Task<bool> DeleteSectionAsync(string code)
        {
            var section = await _sectionRepository.GetAsync(
                x => x.SectionCode == code,
                true);

            if (section == null)
                throw new Exception($"Section '{code}' not found.");

            await _sectionRepository.DeleteAsync(section);

            return true;
        }

        #endregion

        #region Dropdown

        public async Task<List<DropdownDTO>> GetSectionDropdownAsync()
        {
            var sections = await _sectionRepository.GetAllByFilterAsync(
                x => x.IsActive);

            return sections
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.SectionName)
                .Select(x => new DropdownDTO
                {
                    Id = x.Id,
                    Text = x.SectionName,
                    Code = x.SectionCode
                })
                .ToList();
        }

        #endregion
    }
}