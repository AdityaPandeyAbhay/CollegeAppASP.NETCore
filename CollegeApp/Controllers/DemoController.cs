
using CollegeApp.MyLogging;
using Microsoft.AspNetCore.Mvc;
namespace CollegeApp.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class DemoController : Controller
    {
        //1. Losely coupled
        private readonly ILogger<DemoController> _logger;
        public DemoController(ILogger<DemoController> logger)
        {
            _logger = logger;

        }

        [HttpGet]
        public ActionResult Index()        {
            _logger.LogTrace("log massage for trace massage");
            _logger.LogDebug("log massage for Debug massage");
            _logger.LogInformation("log massage for Information massage");
            _logger.LogWarning("log massage for Warning massage");
            _logger.LogError("log massage for Error massage");
            _logger.LogCritical("log massage for Critical massage");

            return Ok();
        }

    }
}
