using Model.Models.Notice_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface INoticeService
    {
        Task<GetNoticeDTO> CreateNoticeAsync(CreateNoticeDTO dto);

        Task<List<GetNoticeDTO>> GetNonPublishedAsync();

        Task<GetNoticeDTO> GetNonPublishedByIdAsync(int id);
        Task<GetNoticeDTO> PublishNoticeAsync(int id);

        Task<List<GetNoticeDTO>> GetAllPublishedAsync();
        Task<List<NonPublishedNoticeDTO>> GetNonPublishedDropdownAsync();

    }
}
