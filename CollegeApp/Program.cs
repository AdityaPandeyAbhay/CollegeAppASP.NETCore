using CollegeApp.Configuration;
using CollegeApp.Data;
using CollegeApp.MyLogging;
using CollegeApp.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Repository.ClassOfRepository;
using Repository.InterfaceOfRepository;
using Serilog;
using Service.ClassOfService;
using Service.InterfaceOfService;
using System.Text;






var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();

builder.Logging.AddLog4Net();


#region Serilog Setting 
//Log.Logger = new LoggerConfiguration().
//    MinimumLevel.Information()
//    .WriteTo.File("Log/log.txt",rollingInterval:RollingInterval.Minute)
//    .CreateLogger();
////use this line to override the built - in logger
//builder.Host.UseSerilog();

//// use serilog along with built-in logger
//builder.Logging.AddSerilog();
#endregion


builder.Services.AddDbContext<CollegeDBContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString ("CollegeAppDBConnection"));
});

// Add services to the container.
//builder.Services.AddControllers();

// Swagger Services
builder.Services.AddEndpointsApiExplorer();



builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT Token. Example: Bearer eyJhbGciOiJIUzI1NiIs..."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = new List<string>()
    });
});



builder.Services.AddHttpContextAccessor();


builder.Services.AddAutoMapper(typeof(AutoMapperConfig));
builder.Services.AddControllers()
                .AddNewtonsoftJson();
builder.Services.AddScoped<IMyLogger, LogToServerMemory>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();


builder.Services.AddScoped<INoticeRepository, NoticeRepository>();
builder.Services.AddScoped<INoticeService, NoticeService>();


builder.Services.AddScoped<ICurrentUserServices, CurrentUserServices>();

builder.Services.AddScoped(typeof(ICollegeRepository<>),typeof(CollegeRepository<>));
builder.Services.AddScoped(typeof(IUserRepository),typeof(UserRepository));
builder.Services.AddScoped(typeof(ITeacherRepository), typeof(TeacherRepository));


builder.Services.AddScoped(typeof(INonTeachingStaffRepository), typeof(NonTeachingStaffRepository));
builder.Services.AddScoped<INonTeachingStaffService, NonTeachingStaffService>();


builder.Services.AddScoped(typeof(IDepartmentRepository), typeof(DepartmentRepository));
builder.Services.AddScoped<IDepartmentService, DepartmentService>();


builder.Services.AddScoped(typeof(IAcademicYearRepository), typeof( AcademicYearRepository));
builder.Services.AddScoped<IAcademicYearService, AcademicYearService>();


builder.Services.AddScoped(typeof(IFeeCategoryRepository), typeof(FeeCategoryRepository));
builder.Services.AddScoped<IFeeCategoryService, FeeCategoryService>();

builder.Services.AddScoped(typeof(IFeeStructureRepository), typeof(FeeStructureRepository));
builder.Services.AddScoped<IFeeStructureService, FeeStructureService>();

builder.Services.AddScoped(typeof(IStudentFeeRepository), typeof(StudentFeeRepository));
builder.Services.AddScoped<IStudentFeeService, StudentFeeService>();

builder.Services.AddScoped(typeof(ISchoolClassRepository), typeof(SchoolClassRepository));
builder.Services.AddScoped<IClassService, ClassService>();

builder.Services.AddScoped(typeof(ISectionRepository), typeof(SectionRepository));
builder.Services.AddScoped<ISectionService, SectionService>();

builder.Services.AddScoped(typeof(ISubjectRepository), typeof(SubjectRepository));
builder.Services.AddScoped<ISubjectService, SubjectService>();

builder.Services.AddScoped(typeof(ITeacherAssignmentRepository), typeof(TeacherAssignmentRepository));
builder.Services.AddScoped<ITeacherAssignmentService, TeacherAssignmentService>();

builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();

builder.Services.AddScoped<IResultRepository, ResultRepository>();
builder.Services.AddScoped<IResultService, ResultService>();




//CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
});

//# JWT Authentication

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"] ?? "DefaultCollegeAppJwtSecretKeyShouldBeLongEnoughForValidation1234567890!"))
        };
    });
builder.Services.AddAuthorization();



var app = builder.Build();

// Configure the HTTP request pipeline.
// Enable Swagger in all environments so https://localhost:7164/swagger/index.html is always accessible
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "CollegeApp API v1");
    options.RoutePrefix = "swagger"; // Serves Swagger UI at /swagger
});

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();


app.MapGet("/", () => Results.Redirect("/swagger/index.html"));
app.MapControllers();
app.Run();