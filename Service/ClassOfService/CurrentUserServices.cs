using Microsoft.AspNetCore.Http;
using Service.InterfaceOfService;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Service.ClassOfService
{
    public class CurrentUserServices : ICurrentUserServices
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserServices(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId =>
            _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

        public string? Username =>
            _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name);

        public bool IsAuthenticated =>
            _httpContextAccessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;

        public bool IsInRole(string role)
        {
            return _httpContextAccessor.HttpContext?.User.IsInRole(role) ?? false;
        }
    }
}
