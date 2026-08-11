using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Model.Models.Notice_Model;
using Repository.InterfaceOfRepository;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.ClassOfService
{
    public class NoticeService : INoticeService

    {

        private readonly INoticeRepository _noticeRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<NoticeService> _logger;
        private readonly ICurrentUserServices _currentUserServices;
        private readonly IWebHostEnvironment _environment;
        public NoticeService(INoticeRepository noticeRepository, IMapper mapper, ILogger<NoticeService> logger, ICurrentUserServices currentUserServices, IWebHostEnvironment environment)
        {
            _noticeRepository = noticeRepository;
            _mapper = mapper;
            _logger = logger;
            _currentUserServices = currentUserServices;
            _environment = environment;
        }

        public async Task<GetNoticeDTO> CreateNoticeAsync(CreateNoticeDTO dto)
        {
            if (dto == null) {
                throw new Exception("Notice cannot be null.");
            }
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                throw new Exception("Notice title is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.Description))
            {
                throw new Exception("Notice description is required.");
            }

            if (dto.PdfFile == null || dto.PdfFile.Length == 0)
            {
                throw new Exception("PDF file is required.");
            }

            // Only PDF allowed
            if (!string.Equals(
                    Path.GetExtension(dto.PdfFile.FileName),
                    ".pdf",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Only PDF files are allowed.");
            }

            // Maximum file size: 10 MB
            const long maxFileSize = 10 * 1024 * 1024;

            if (dto.PdfFile.Length > maxFileSize)
            {
                throw new Exception("PDF file size cannot exceed 10 MB.");
            }
            // Map basic properties

            var notice = _mapper.Map<Notice>(dto);


            // ============================
            // PDF FILE LOGIC
            // ============================

            // ============================
            // PDF FILE LOGIC
            // ============================

            string noticesFolder = Path.Combine(
                _environment.WebRootPath,
                "Notices");

            if (!Directory.Exists(noticesFolder))
            {
                Directory.CreateDirectory(noticesFolder);
            }

            // Original file name
            notice.PdfFileName = Path.GetFileName(dto.PdfFile.FileName);

            // Generate unique physical file name
            string storedFileName =
                $"{Guid.NewGuid()}{Path.GetExtension(dto.PdfFile.FileName)}";

            string physicalFilePath =
                Path.Combine(noticesFolder, storedFileName);

            // Save PDF
            using (var stream = new FileStream(
                physicalFilePath,
                FileMode.Create))
            {
                await dto.PdfFile.CopyToAsync(stream);
            }

            // Relative path stored in database
            notice.PdfPath = $"/Notices/{storedFileName}";

            // ============================
            // NOTICE BUSINESS LOGIC
            // ============================

            notice.CreatedBy = _currentUserServices.UserId;

            notice.CreatedDate = DateTime.UtcNow;

            // Newly created notice is a draft
            notice.IsPublished = false;

            // Not published yet
            notice.PublishedDate = null;

            // New notice is active
            notice.IsActive = true;

            // ============================
            // SAVE DATABASE
            // ============================

            await _noticeRepository.CreateAsync(notice);

            return _mapper.Map<GetNoticeDTO>(notice);
        }

        public async Task<List<GetNoticeDTO>> GetNonPublishedAsync()
        {
            var notices = await _noticeRepository.GetNonPublishedAsync();

            return _mapper.Map<List<GetNoticeDTO>>(notices);
        }


        public async Task<GetNoticeDTO> GetNonPublishedByIdAsync(int id)
        {
            var notice = await _noticeRepository.GetByIdAsync(id);

            if (notice == null)
            {
                throw new Exception("Notice not found.");
            }

            if (notice.IsPublished)
            {
                throw new Exception("Notice is already published.");
            }

            if (!notice.IsActive)
            {
                throw new Exception("Notice is inactive.");
            }

            return _mapper.Map<GetNoticeDTO>(notice);
        }
        public async Task<GetNoticeDTO> PublishNoticeAsync(int id)
        {
            var notice = await _noticeRepository.GetByIdAsync(id);

            if (notice == null)
            {
                throw new Exception("Notice not found.");
            } 

            if (!notice.IsActive)
            {
                throw new Exception("Inactive notice cannot be published.");
            }

            if (notice.IsPublished)
            {
                throw new Exception("Notice is already published.");
            }

            // Publish
            notice.IsPublished = true;

            // Set publish date/time
            notice.PublishedDate = DateTime.UtcNow;

            // Make sure it remains active
            notice.IsActive = true;

            await _noticeRepository.UpdateAsync(notice);
            return _mapper.Map<GetNoticeDTO>(notice);
        }

        public async Task<List<GetNoticeDTO>> GetAllPublishedAsync()
        {
            var notices = await _noticeRepository.GetAllPublishedAsync();

            return _mapper.Map<List<GetNoticeDTO>>(notices);


        }

        public async Task<List<NonPublishedNoticeDTO>> GetNonPublishedDropdownAsync()
        {
            var notices = await _noticeRepository.GetNonPublishedAsync();

            return _mapper.Map<List<NonPublishedNoticeDTO>>(notices);
        }

    }
}