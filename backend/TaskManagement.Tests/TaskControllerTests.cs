using System;
using System.Threading.Tasks;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Moq;
using TaskManagement.API.Controllers;
using TaskManagement.API.Models;
using TaskManagement.API.Services;
using System.Collections.Generic;
using System.Linq;
using TaskStatus = TaskManagement.API.Models.TaskStatus;

namespace TaskManagement.Tests
{
    public class TaskControllerTests
    {
        private readonly Mock<ITaskService> _mockTaskService;
        private readonly TaskController _controller;

        public TaskControllerTests()
        {
            _mockTaskService = new Mock<ITaskService>();
            _controller = new TaskController(_mockTaskService.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult()
        {
            // Arrange
            var tasks = new List<TaskItem>
            {
                new TaskItem
                {
                    Id = 1,
                    Title = "テストタスク1",
                    Description = "説明1",
                    Status = TaskStatus.NotStarted,
                    DueDate = DateTime.Now.AddDays(7),
                    AssignedTo = "ユーザー1"
                },
                new TaskItem
                {
                    Id = 2,
                    Title = "テストタスク2",
                    Description = "説明2",
                    Status = TaskStatus.InProgress,
                    DueDate = DateTime.Now.AddDays(14),
                    AssignedTo = "ユーザー2"
                }
            };

            _mockTaskService.Setup(s => s.GetAllTasksAsync())
                .ReturnsAsync(tasks);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<List<TaskItem>>(okResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public async Task GetById_ExistingTask_ReturnsOkResult()
        {
            // Arrange
            var task = new TaskItem
            {
                Id = 1,
                Title = "テストタスク",
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            _mockTaskService.Setup(s => s.GetTaskByIdAsync(1))
                .ReturnsAsync(task);

            // Act
            var result = await _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<TaskItem>(okResult.Value);
            Assert.Equal(task.Id, returnValue.Id);
            Assert.Equal(task.Title, returnValue.Title);
        }

        [Fact]
        public async Task GetById_NonExistentTask_ReturnsNotFound()
        {
            // Arrange
            _mockTaskService.Setup(s => s.GetTaskByIdAsync(999))
                .ReturnsAsync((TaskItem?)null);

            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Create_ValidTask_ReturnsCreatedAtAction()
        {
            // Arrange
            var newTask = new TaskItem
            {
                Title = "新規タスク",
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            _mockTaskService.Setup(s => s.CreateTaskAsync(It.IsAny<TaskItem>()))
                .ReturnsAsync(newTask);

            // Act
            var result = await _controller.Create(newTask);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var returnValue = Assert.IsType<TaskItem>(createdAtActionResult.Value);
            Assert.Equal(newTask.Title, returnValue.Title);
            Assert.Equal("GetById", createdAtActionResult.ActionName);
        }

        [Fact]
        public async Task Create_InvalidModel_ReturnsBadRequest()
        {
            // Arrange
            var invalidTask = new TaskItem
            {
                Title = "", // 無効なタイトル
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            _controller.ModelState.AddModelError("Title", "タイトルは必須です");

            // Act
            var result = await _controller.Create(invalidTask);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task Update_ValidTask_ReturnsOkResult()
        {
            // Arrange
            var existingTask = new TaskItem
            {
                Id = 1,
                Title = "更新タスク",
                Description = "説明",
                Status = TaskStatus.InProgress,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            _mockTaskService.Setup(s => s.UpdateTaskAsync(It.IsAny<TaskItem>()))
                .ReturnsAsync(existingTask);

            // Act
            var result = await _controller.Update(1, existingTask);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<TaskItem>(okResult.Value);
            Assert.Equal(existingTask.Id, returnValue.Id);
            Assert.Equal(existingTask.Status, returnValue.Status);
        }

        [Fact]
        public async Task Update_NonExistentTask_ReturnsNotFound()
        {
            // Arrange
            var nonExistentTask = new TaskItem
            {
                Id = 999,
                Title = "存在しないタスク",
                Description = "説明",
                Status = TaskStatus.NotStarted,
                DueDate = DateTime.Now.AddDays(7),
                AssignedTo = "ユーザー"
            };

            _mockTaskService.Setup(s => s.UpdateTaskAsync(It.IsAny<TaskItem>()))
                .ThrowsAsync(new KeyNotFoundException());

            // Act
            var result = await _controller.Update(999, nonExistentTask);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Delete_ExistingTask_ReturnsNoContent()
        {
            // Arrange
            _mockTaskService.Setup(s => s.DeleteTaskAsync(1))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task Delete_NonExistentTask_ReturnsNotFound()
        {
            // Arrange
            _mockTaskService.Setup(s => s.DeleteTaskAsync(999))
                .ThrowsAsync(new KeyNotFoundException());

            // Act
            var result = await _controller.Delete(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
} 