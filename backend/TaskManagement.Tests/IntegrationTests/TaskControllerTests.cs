using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Testing;
using TaskManagement.API.Models;
using Xunit;
using TaskManagement.API;
using TaskStatus = TaskManagement.API.Models.TaskStatus;

namespace TaskManagement.Tests.IntegrationTests
{
    public class TaskControllerTests : IClassFixture<CustomWebApplicationFactory>
    {
        private readonly HttpClient _client;
        private readonly JsonSerializerOptions _jsonOptions;

        public TaskControllerTests(CustomWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
            
            // Configure JSON serializer options for enum conversion
            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = null,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };
            _jsonOptions.Converters.Add(new JsonStringEnumConverter());
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult()
        {
            // Act
            var response = await _client.GetAsync("/api/task");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetById_WithValidId_ReturnsTask()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "テストタスク",
                Description = "テスト用のタスクです",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "Test User",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var createResponse = await _client.PostAsJsonAsync("/api/task", task, _jsonOptions);
            var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskItem>(_jsonOptions);

            // Act
            var response = await _client.GetAsync($"/api/task/{createdTask.Id}");

            // Assert
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TaskItem>(_jsonOptions);
            Assert.Equal(createdTask.Id, result.Id);
            Assert.Equal(task.Title, result.Title);
        }

        [Fact]
        public async Task GetById_WithInvalidId_ReturnsNotFound()
        {
            // Act
            var response = await _client.GetAsync("/api/task/999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task Create_WithValidTask_ReturnsCreatedTask()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "新規タスク",
                Description = "新規作成のテスト",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(10),
                AssignedTo = "New User",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/task", task, _jsonOptions);

            // Assert
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TaskItem>(_jsonOptions);
            Assert.NotNull(result);
            Assert.Equal(task.Title, result.Title);
            Assert.Equal(task.Description, result.Description);
        }

        [Fact]
        public async Task Update_WithValidTask_ReturnsUpdatedTask()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "更新前タスク",
                Description = "更新前の説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(5),
                AssignedTo = "Update User",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var createResponse = await _client.PostAsJsonAsync("/api/task", task, _jsonOptions);
            var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskItem>(_jsonOptions);

            createdTask.Title = "更新後タスク";
            createdTask.Description = "更新後の説明";
            createdTask.Status = TaskStatus.InProgress;
            createdTask.UpdatedAt = DateTime.Now.AddHours(1);

            // Act
            var response = await _client.PutAsJsonAsync($"/api/task/{createdTask.Id}", createdTask, _jsonOptions);

            // Assert
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<TaskItem>(_jsonOptions);
            Assert.Equal(createdTask.Title, result.Title);
            Assert.Equal(createdTask.Description, result.Description);
            Assert.Equal(createdTask.Status, result.Status);
        }

        [Fact]
        public async Task Delete_WithValidId_ReturnsNoContent()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "削除対象タスク",
                Description = "削除テスト用",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(3),
                AssignedTo = "Delete User",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var createResponse = await _client.PostAsJsonAsync("/api/task", task, _jsonOptions);
            var createdTask = await createResponse.Content.ReadFromJsonAsync<TaskItem>(_jsonOptions);

            // Act
            var response = await _client.DeleteAsync($"/api/task/{createdTask.Id}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the task is actually deleted
            var getResponse = await _client.GetAsync($"/api/task/{createdTask.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }
    }
} 