using Model.Models.Notice_Model;
using System;
using System.Collections.Generic;
using System.Text;

namespace Repository.InterfaceOfRepository
{
    public interface INoticeRepository : ICollegeRepository<Notice>
    {
        Task<List<Notice>> GetNonPublishedAsync();

        Task<List<Notice>> GetAllPublishedAsync();

        Task<Notice?> GetByIdAsync(int id);

        Task<List<Notice>> GetNonPublishedDropAsync();
    }
}
