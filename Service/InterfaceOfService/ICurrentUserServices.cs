using System;
using System.Collections.Generic;
using System.Text;

namespace Service.InterfaceOfService
{
    public interface ICurrentUserServices
    {
        string? UserId { get; }
        string? Username { get; }
        bool IsAuthenticated { get; }

        bool IsInRole(string role);

    }
}
