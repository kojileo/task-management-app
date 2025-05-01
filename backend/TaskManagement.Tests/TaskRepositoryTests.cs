using System;
using System.Threading.Tasks;
using Xunit;
using TaskManagement.API.Models;
using TaskManagement.API.Data;
using TaskManagement.API.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using TaskStatus = TaskManagement.API.Models.TaskStatus;

namespace TaskManagement.Tests
{
    public class TaskRepositoryTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly TaskRepository _repository;

        public TaskRepositoryTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
                .Options;

            _context = new ApplicationDbContext(options);
            _repository = new TaskRepository(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetAllAsync_ReturnsAllTasks()
        {
            // Arrange
            var tasks = new List<TaskItem>
            {
                new TaskItem
                {
                    Title = "テストタスク1",
                    Description = "説明1",
                    Status = TaskStatus.NotStarted,
                    DueDate = DateTime.Now.AddDays(7),
                    AssignedTo = "ユーザー1"
                },
                new TaskItem
                {
                    Title = "テストタスク2",
                    Description = "説明2",
                    Status = TaskStatus.InProgress,
                    DueDate = DateTime.Now.AddDays(14),
                    AssignedTo = "ユーザー2"
                }
            };

            await _context.Tasks.AddRangeAsync(tasks);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Contains(result, t => t.Title == "テストタスク1");
            Assert.Contains(result, t => t.Title == "テストタスク2");
        }

        [Fact]
        public async Task GetByIdAsync_ExistingTask_ReturnsTask()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "テストタスク",
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync(task.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(task.Title, result.Title);
            Assert.Equal(task.Description, result.Description);
            Assert.Equal(task.Status, result.Status);
        }

        [Fact]
        public async Task GetByIdAsync_NonExistentTask_ReturnsNull()
        {
            // Act
            var result = await _repository.GetByIdAsync(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task AddAsync_ValidTask_AddsTask()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "新規タスク",
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            // Act
            var result = await _repository.AddAsync(task);
            await _context.SaveChangesAsync();

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(0, result.Id);
            var savedTask = await _context.Tasks.FindAsync(result.Id);
            Assert.NotNull(savedTask);
            Assert.Equal(task.Title, savedTask.Title);
        }

        [Fact]
        public async Task UpdateAsync_ExistingTask_UpdatesTask()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "更新前タスク",
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();

            task.Title = "更新後タスク";
            task.Status = TaskStatus.InProgress;

            // Act
            var result = await _repository.UpdateAsync(task);
            await _context.SaveChangesAsync();

            // Assert
            Assert.NotNull(result);
            Assert.Equal("更新後タスク", result.Title);
            Assert.Equal(TaskStatus.InProgress, result.Status);
            var savedTask = await _context.Tasks.FindAsync(task.Id);
            Assert.NotNull(savedTask);
            Assert.Equal("更新後タスク", savedTask.Title);
        }

        [Fact]
        public async Task DeleteAsync_ExistingTask_DeletesTask()
        {
            // Arrange
            var task = new TaskItem
            {
                Title = "削除対象タスク",
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            await _context.Tasks.AddAsync(task);
            await _context.SaveChangesAsync();

            // Act
            await _repository.DeleteAsync(task.Id);
            await _context.SaveChangesAsync();

            // Assert
            var deletedTask = await _context.Tasks.FindAsync(task.Id);
            Assert.Null(deletedTask);
        }

        [Fact]
        public async Task DeleteAsync_NonExistentTask_ThrowsException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => 
                _repository.DeleteAsync(999));
        }
    }
} 