using System.Net;
using System.Net.Http.Json;
using System.Text;
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
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
                PropertyNameCaseInsensitive = true,
                MaxDepth = 64,
                ReadCommentHandling = JsonCommentHandling.Skip
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
                AssignedTo = "Test User"
            };

            var createResponse = await _client.PostAsync(
                "/api/task", 
                CreateJsonContent(task));
            
            createResponse.EnsureSuccessStatusCode();
            
            // レスポンスをJSONとして読み込み、Dictionary<string, JsonElement>として処理
            var jsonString = await createResponse.Content.ReadAsStringAsync();
            var responseDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString);
            
            Assert.NotNull(responseDict);
            Assert.True(responseDict.ContainsKey("id"), "レスポンスにIDが含まれていません");
            var createdTaskId = responseDict["id"].GetInt32();

            // Act
            var response = await _client.GetAsync($"/api/task/{createdTaskId}");

            // Assert
            response.EnsureSuccessStatusCode();
            
            jsonString = await response.Content.ReadAsStringAsync();
            responseDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString);
            
            Assert.NotNull(responseDict);
            Assert.Equal(createdTaskId, responseDict["id"].GetInt32());
            Assert.Equal(task.Title, responseDict["title"].GetString());
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
                AssignedTo = "New User"
            };

            // Act
            var response = await _client.PostAsync(
                "/api/task", 
                CreateJsonContent(task));

            // Assert
            response.EnsureSuccessStatusCode();
            
            var jsonString = await response.Content.ReadAsStringAsync();
            var responseDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString);
            
            Assert.NotNull(responseDict);
            Assert.True(responseDict.ContainsKey("title"), "レスポンスにタイトルが含まれていません");
            Assert.Equal(task.Title, responseDict["title"].GetString());
            Assert.Equal(task.Description, responseDict["description"].GetString());
        }

        [Fact]
        public async Task Update_WithValidTask_ReturnsUpdatedTask()
        {
            // Arrange - まず新しいタスクを作成
            var task = new TaskItem
            {
                Title = "更新前タスク",
                Description = "更新前の説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(5),
                AssignedTo = "Update User"
            };

            var createResponse = await _client.PostAsync(
                "/api/task", 
                CreateJsonContent(task));
            
            createResponse.EnsureSuccessStatusCode();
            
            var jsonString = await createResponse.Content.ReadAsStringAsync();
            var responseDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString);
            
            Assert.NotNull(responseDict);
            var createdTaskId = responseDict["id"].GetInt32();

            // 更新するタスクデータを作成
            var updatedTask = new
            {
                Id = createdTaskId,
                Title = "更新後タスク",
                Description = "更新後の説明",
                Status = 1, // InProgress
                DueDate = DateTime.Now.AddDays(5),
                AssignedTo = "Update User"
            };

            // Act
            var response = await _client.PutAsync(
                $"/api/task/{createdTaskId}", 
                CreateJsonContent(updatedTask));

            // Assert
            response.EnsureSuccessStatusCode();
            
            jsonString = await response.Content.ReadAsStringAsync();
            responseDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString);
            
            Assert.NotNull(responseDict);
            Assert.Equal(updatedTask.Title, responseDict["title"].GetString());
            Assert.Equal(updatedTask.Description, responseDict["description"].GetString());
            Assert.Equal(updatedTask.Status, responseDict["status"].GetInt32());
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
                AssignedTo = "Delete User"
            };

            var createResponse = await _client.PostAsync(
                "/api/task", 
                CreateJsonContent(task));
            
            createResponse.EnsureSuccessStatusCode();
            
            var jsonString = await createResponse.Content.ReadAsStringAsync();
            var responseDict = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonString);
            
            Assert.NotNull(responseDict);
            var createdTaskId = responseDict["id"].GetInt32();

            // Act
            var response = await _client.DeleteAsync($"/api/task/{createdTaskId}");

            // Assert
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            // Verify the task is actually deleted
            var getResponse = await _client.GetAsync($"/api/task/{createdTaskId}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        // ヘルパーメソッド：オブジェクトをJSONに変換してStringContentを作成
        private StringContent CreateJsonContent(object obj)
        {
            var json = JsonSerializer.Serialize(obj, _jsonOptions);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }
    }
} 