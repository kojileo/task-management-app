using Microsoft.OpenApi.Models;
using System.Text.Json.Serialization;
using TaskManagement.API.Repositories;
using TaskManagement.API.Services;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Task Management API", Version = "v1" });
});

// データベースパスの設定
var dbPath = Path.Join(builder.Environment.ContentRootPath, "Data", "tasks.db");
var dbDirectory = Path.GetDirectoryName(dbPath);
if (!Directory.Exists(dbDirectory))
{
    Directory.CreateDirectory(dbDirectory!);
}

// SQLiteの設定
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlite($"Data Source={dbPath}");
    
    // 開発環境の場合、詳細なログを有効化
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging()
               .EnableDetailedErrors();
    }
});

// Register repositories
builder.Services.AddScoped<ITaskRepository, TaskRepository>();

// Register services
builder.Services.AddScoped<TaskService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Task Management API v1");
    });
}

app.UseHttpsRedirection();

// Use CORS
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

// データベースの初期化
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
