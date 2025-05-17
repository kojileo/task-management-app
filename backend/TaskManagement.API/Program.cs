using Microsoft.AspNetCore.Builder;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Models;
using TaskManagement.API.Services;
using TaskManagement.API.Repositories;
using TaskManagement.API.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews(options =>
{
    options.SuppressAsyncSuffixInActionNames = false;
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true;
}).AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.PropertyNamingPolicy = null;
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.MaxDepth = 64;
    options.JsonSerializerOptions.ReadCommentHandling = JsonCommentHandling.Skip;
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TaskManagement API", Version = "v1" });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// DI
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    // SQLiteからインメモリデータベースに変更
    options.UseInMemoryDatabase("TasksDb");
});

// Error handling
builder.Services.AddProblemDetails();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Seed test data in development
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        // Test data
        if (!dbContext.Tasks.Any())
        {
            dbContext.Tasks.Add(new TaskItem
            {
                Id = 1,
                Title = "Complete project setup",
                Description = "Initialize the repository and set up basic infrastructure",
                Status = TaskManagement.API.Models.TaskStatus.Completed,
                DueDate = DateTime.Now.AddDays(1),
                AssignedTo = "John Doe",
                CreatedAt = DateTime.Now.AddDays(-5),
                UpdatedAt = DateTime.Now.AddDays(-1)
            });

            dbContext.Tasks.Add(new TaskItem
            {
                Id = 2,
                Title = "Implement API endpoints",
                Description = "Create REST API endpoints for task management",
                Status = TaskManagement.API.Models.TaskStatus.InProgress,
                DueDate = DateTime.Now.AddDays(3),
                AssignedTo = "Jane Smith",
                CreatedAt = DateTime.Now.AddDays(-3),
                UpdatedAt = DateTime.Now
            });

            dbContext.Tasks.Add(new TaskItem
            {
                Id = 3,
                Title = "Design UI mockups",
                Description = "Create UI design for the task management application",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "Alice Johnson",
                CreatedAt = DateTime.Now.AddDays(-1),
                UpdatedAt = DateTime.Now.AddDays(-1)
            });

            dbContext.SaveChanges();
        }
    }
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();

// Make Program class public for integration tests
public partial class Program 
{ 
    // This class is intentionally left empty and is used only for integration tests
}
