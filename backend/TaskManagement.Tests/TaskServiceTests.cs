using System;
using System.Threading.Tasks;
using Xunit;
using TaskManagement.API.Models;
using TaskManagement.API.Services;
using TaskManagement.API.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace TaskManagement.Tests
{
    public class TaskServiceTests
    {
        private readonly ApplicationDbContext _context;
        private readonly TaskService _taskService;

        public TaskServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDatabase_{Guid.NewGuid()}")
                .Options;

            _context = new ApplicationDbContext(options);
            _taskService = new TaskService(_context);
        }

        [Fact]
        public async Task GetTasks_ReturnsAllTasks()
        {
            // Arrange
            var tasks = new List<TaskItem>
            {
                new TaskItem
                {
                    Id = 1,
                    Title = "テストタスク1",
                    Description = "テスト説明1",
                    Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                    DueDate = DateTime.Now.AddDays(7),
                    AssignedTo = "テストユーザー1"
                },
                new TaskItem
                {
                    Id = 2,
                    Title = "テストタスク2",
                    Description = "テスト説明2",
                    Status = TaskManagement.API.Models.TaskStatus.InProgress,
                    DueDate = DateTime.Now.AddDays(14),
                    AssignedTo = "テストユーザー2"
                }
            };

            await _context.Tasks.AddRangeAsync(tasks);
            await _context.SaveChangesAsync();

            // Act
            var result = await _taskService.GetAllTasksAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, t => t.Title == "テストタスク1");
            Assert.Contains(result, t => t.Title == "テストタスク2");
        }

        [Fact]
        public async Task CreateTask_ValidTask_ReturnsCreatedTask()
        {
            // Arrange
            var newTask = new TaskItem
            {
                Title = "新規タスク",
                Description = "新規説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            // Act
            var result = await _taskService.CreateTaskAsync(newTask);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(newTask.Title, result.Title);
            Assert.Equal(newTask.Description, result.Description);
            Assert.Equal(newTask.Status, result.Status);
            Assert.Equal(newTask.DueDate.Date, result.DueDate.Date);
            Assert.Equal(newTask.AssignedTo, result.AssignedTo);

            var savedTask = await _context.Tasks.FindAsync(result.Id);
            Assert.NotNull(savedTask);
            Assert.Equal(newTask.Title, savedTask.Title);
        }

        [Fact]
        public async Task UpdateTaskStatus_ValidStatus_UpdatesTask()
        {
            // Arrange
            var existingTask = new TaskItem
            {
                Title = "既存タスク",
                Description = "既存説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            await _context.Tasks.AddAsync(existingTask);
            await _context.SaveChangesAsync();

            var updatedTask = new TaskItem
            {
                Id = existingTask.Id,
                Title = existingTask.Title,
                Description = existingTask.Description,
                Status = TaskManagement.API.Models.TaskStatus.InProgress,
                DueDate = existingTask.DueDate,
                AssignedTo = existingTask.AssignedTo
            };

            // Act
            var result = await _taskService.UpdateTaskAsync(updatedTask);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(TaskManagement.API.Models.TaskStatus.InProgress, result.Status);
            Assert.Equal(existingTask.Title, result.Title);
            Assert.Equal(existingTask.Description, result.Description);

            var savedTask = await _context.Tasks.FindAsync(existingTask.Id);
            Assert.NotNull(savedTask);
            Assert.Equal(TaskManagement.API.Models.TaskStatus.InProgress, savedTask.Status);
        }

        [Fact]
        public async Task DeleteTask_ExistingTask_DeletesTask()
        {
            // Arrange
            var existingTask = new TaskItem
            {
                Title = "削除対象タスク",
                Description = "削除対象説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            await _context.Tasks.AddAsync(existingTask);
            await _context.SaveChangesAsync();

            // Act
            await _taskService.DeleteTaskAsync(existingTask.Id);

            // Assert
            var deletedTask = await _context.Tasks.FindAsync(existingTask.Id);
            Assert.Null(deletedTask);
        }

        [Fact]
        public async Task GetTaskById_ExistingTask_ReturnsTask()
        {
            // Arrange
            var existingTask = new TaskItem
            {
                Title = "既存タスク",
                Description = "既存説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            await _context.Tasks.AddAsync(existingTask);
            await _context.SaveChangesAsync();

            // Act
            var result = await _taskService.GetTaskByIdAsync(existingTask.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(existingTask.Id, result.Id);
            Assert.Equal(existingTask.Title, result.Title);
            Assert.Equal(existingTask.Description, result.Description);
            Assert.Equal(existingTask.Status, result.Status);
            Assert.Equal(existingTask.DueDate.Date, result.DueDate.Date);
            Assert.Equal(existingTask.AssignedTo, result.AssignedTo);
        }

        [Fact]
        public async Task CreateTask_InvalidTask_ThrowsException()
        {
            // Arrange
            var invalidTask = new TaskItem
            {
                // Titleは必須フィールド
                Title = "",
                Description = "説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _taskService.CreateTaskAsync(invalidTask));
        }

        [Fact]
        public async Task UpdateTask_NonExistentTask_ThrowsException()
        {
            // Arrange
            var nonExistentTask = new TaskItem
            {
                Id = 999,
                Title = "存在しないタスク",
                Description = "説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => 
                _taskService.UpdateTaskAsync(nonExistentTask));
        }

        [Fact]
        public async Task DeleteTask_NonExistentTask_ThrowsException()
        {
            // Arrange
            var nonExistentTaskId = 999;

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => 
                _taskService.DeleteTaskAsync(nonExistentTaskId));
        }

        [Fact]
        public async Task GetTaskById_NonExistentTask_ReturnsNull()
        {
            // Arrange
            var nonExistentTaskId = 999;

            // Act
            var result = await _taskService.GetTaskByIdAsync(nonExistentTaskId);

            // Assert
            Assert.Null(result);
        }

        [Theory]
        [InlineData(TaskManagement.API.Models.TaskStatus.NotStarted)]
        [InlineData(TaskManagement.API.Models.TaskStatus.InProgress)]
        [InlineData(TaskManagement.API.Models.TaskStatus.Completed)]
        public async Task CreateTask_WithDifferentStatuses_CreatesTaskSuccessfully(TaskManagement.API.Models.TaskStatus status)
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "ステータステスト",
                Description = "説明",
                Status = status,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            // Act
            var result = await _taskService.CreateTaskAsync(task);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(status, result.Status);
            
            var savedTask = await _context.Tasks.FindAsync(result.Id);
            Assert.NotNull(savedTask);
            Assert.Equal(status, savedTask.Status);
        }

        [Fact]
        public async Task UpdateTask_WithPastDueDate_UpdatesSuccessfully()
        {
            // Arrange
            var existingTask = new TaskItem
            {
                Title = "期限切れタスク",
                Description = "説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(-7),
                AssignedTo = "テストユーザー"
            };

            await _context.Tasks.AddAsync(existingTask);
            await _context.SaveChangesAsync();

            var updatedTask = new TaskItem
            {
                Id = existingTask.Id,
                Title = existingTask.Title,
                Description = existingTask.Description,
                Status = TaskManagement.API.Models.TaskStatus.Completed,
                DueDate = existingTask.DueDate,
                AssignedTo = existingTask.AssignedTo
            };

            // Act
            var result = await _taskService.UpdateTaskAsync(updatedTask);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(TaskManagement.API.Models.TaskStatus.Completed, result.Status);
            Assert.True(result.DueDate < DateTime.Now);
        }

        [Fact]
        public async Task CreateTask_WithMaxLengthFields_CreatesTaskSuccessfully()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = new string('a', 100), // 最大長
                Description = new string('b', 500), // 最大長
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = new string('c', 50) // 最大長
            };

            // Act
            var result = await _taskService.CreateTaskAsync(task);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(100, result.Title.Length);
            Assert.Equal(500, result.Description.Length);
            Assert.Equal(50, result.AssignedTo.Length);
        }

        [Fact]
        public async Task UpdateTask_WithEmptyDescription_UpdatesSuccessfully()
        {
            // Arrange
            var existingTask = new TaskItem
            {
                Title = "テストタスク",
                Description = "説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            await _context.Tasks.AddAsync(existingTask);
            await _context.SaveChangesAsync();

            var updatedTask = new TaskItem
            {
                Id = existingTask.Id,
                Title = existingTask.Title,
                Description = "", // 空の説明
                Status = existingTask.Status,
                DueDate = existingTask.DueDate,
                AssignedTo = existingTask.AssignedTo
            };

            // Act
            var result = await _taskService.UpdateTaskAsync(updatedTask);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("", result.Description);
        }

        [Fact]
        public async Task GetAllTasks_WithEmptyDatabase_ReturnsEmptyList()
        {
            // Act
            var result = await _taskService.GetAllTasksAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task UpdateTask_WithSameData_UpdatesSuccessfully()
        {
            // Arrange
            var existingTask = new TaskItem
            {
                Title = "テストタスク",
                Description = "説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "テストユーザー"
            };

            await _context.Tasks.AddAsync(existingTask);
            await _context.SaveChangesAsync();

            var updatedTask = new TaskItem
            {
                Id = existingTask.Id,
                Title = existingTask.Title,
                Description = existingTask.Description,
                Status = existingTask.Status,
                DueDate = existingTask.DueDate,
                AssignedTo = existingTask.AssignedTo
            };

            // Act
            var result = await _taskService.UpdateTaskAsync(updatedTask);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(existingTask.Title, result.Title);
            Assert.Equal(existingTask.Description, result.Description);
            Assert.Equal(existingTask.Status, result.Status);
            Assert.Equal(existingTask.DueDate.Date, result.DueDate.Date);
            Assert.Equal(existingTask.AssignedTo, result.AssignedTo);
        }

        [Fact]
        public async Task CreateTask_WithFutureDueDate_CreatesTaskSuccessfully()
        {
            // Arrange
            var futureDate = DateTime.Now.AddYears(1);
            var task = new TaskItem
            {
                Title = "将来のタスク",
                Description = "説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = futureDate,
                AssignedTo = "テストユーザー"
            };

            // Act
            var result = await _taskService.CreateTaskAsync(task);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(futureDate.Date, result.DueDate.Date);
        }

        [Fact]
        public async Task CreateTask_WithCurrentDueDate_CreatesTaskSuccessfully()
        {
            // Arrange
            var currentDate = DateTime.Now;
            var task = new TaskItem
            {
                Title = "今日のタスク",
                Description = "説明",
                Status = TaskManagement.API.Models.TaskStatus.NotStarted,
                DueDate = currentDate,
                AssignedTo = "テストユーザー"
            };

            // Act
            var result = await _taskService.CreateTaskAsync(task);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(currentDate.Date, result.DueDate.Date);
        }
    }
} 