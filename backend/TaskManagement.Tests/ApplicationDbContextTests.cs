using System;
using Xunit;
using TaskManagement.API.Data;
using TaskManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using TaskStatus = TaskManagement.API.Models.TaskStatus;

namespace TaskManagement.Tests
{
    public class ApplicationDbContextTests : IDisposable
    {
        private readonly ApplicationDbContext _context;

        public ApplicationDbContextTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
                .Options;

            _context = new ApplicationDbContext(options);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public void OnModelCreating_ConfiguresTaskEntity()
        {
            // Act
            var entityType = _context.Model.FindEntityType(typeof(TaskItem));

            // Assert
            Assert.NotNull(entityType);
            var titleProperty = entityType?.FindProperty("Title");
            var assignedToProperty = entityType?.FindProperty("AssignedTo");
            var descriptionProperty = entityType?.FindProperty("Description");

            Assert.NotNull(titleProperty);
            Assert.NotNull(assignedToProperty);
            Assert.NotNull(descriptionProperty);

            Assert.False(titleProperty.IsNullable);
            Assert.False(assignedToProperty.IsNullable);
            Assert.True(descriptionProperty.IsNullable);

            Assert.Equal(100, titleProperty.GetMaxLength());
            Assert.Equal(50, assignedToProperty.GetMaxLength());
            Assert.Equal(500, descriptionProperty.GetMaxLength());
        }

        [Fact]
        public void OnModelCreating_ConfiguresTaskStatusEnum()
        {
            // Act
            var entityType = _context.Model.FindEntityType(typeof(TaskItem));
            var statusProperty = entityType?.FindProperty("Status");

            // Assert
            Assert.NotNull(statusProperty);
            Assert.Equal(typeof(TaskStatus), statusProperty.ClrType);
        }

        [Fact]
        public void OnModelCreating_ConfiguresDueDate()
        {
            // Act
            var entityType = _context.Model.FindEntityType(typeof(TaskItem));
            var dueDateProperty = entityType?.FindProperty("DueDate");

            // Assert
            Assert.NotNull(dueDateProperty);
            Assert.Equal(typeof(DateTime), dueDateProperty.ClrType);
        }

        [Fact]
        public async Task SaveChangesAsync_ValidTask_SavesSuccessfully()
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

            // Act
            _context.Tasks.Add(task);
            var result = await _context.SaveChangesAsync();

            // Assert
            Assert.Equal(1, result);
            var savedTask = await _context.Tasks.FindAsync(task.Id);
            Assert.NotNull(savedTask);
            Assert.Equal(task.Title, savedTask.Title);
        }

        [Fact]
        public async Task SaveChangesAsync_InvalidTask_ThrowsException()
        {
            // Arrange
            var invalidTask = new TaskItem
            {
                Title = "", // 無効なタイトル
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "" // 無効なAssignedTo
            };

            // Act & Assert
            _context.Tasks.Add(invalidTask);
            await Assert.ThrowsAsync<DbUpdateException>(() => 
                _context.SaveChangesAsync());
        }

        [Fact]
        public void Tasks_DbSet_IsConfigured()
        {
            // Assert
            Assert.NotNull(_context.Tasks);
            Assert.IsAssignableFrom<DbSet<TaskItem>>(_context.Tasks);
        }
    }
} 