using Microsoft.EntityFrameworkCore;
using TaskManagement.API.Data;
using TaskManagement.API.Models;

namespace TaskManagement.API.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;

        public TaskService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaskItem>> GetAllTasksAsync()
        {
            return await _context.Tasks.ToListAsync();
        }

        public async Task<TaskItem?> GetTaskByIdAsync(int id)
        {
            return await _context.Tasks.FindAsync(id);
        }

        public async Task<TaskItem> CreateTaskAsync(TaskItem task)
        {
            ValidateTask(task);
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<TaskItem> UpdateTaskAsync(TaskItem task)
        {
            ValidateTask(task);
            
            var existingTask = await _context.Tasks.FindAsync(task.Id);
            if (existingTask == null)
            {
                throw new KeyNotFoundException($"Task with ID {task.Id} not found.");
            }

            existingTask.Title = task.Title;
            existingTask.Description = task.Description;
            existingTask.Status = task.Status;
            existingTask.DueDate = task.DueDate;
            existingTask.AssignedTo = task.AssignedTo;

            await _context.SaveChangesAsync();
            return existingTask;
        }

        public async Task DeleteTaskAsync(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
            {
                throw new KeyNotFoundException($"Task with ID {id} not found.");
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }

        private void ValidateTask(TaskItem task)
        {
            if (string.IsNullOrWhiteSpace(task.Title))
            {
                throw new ArgumentException("Title is required.", nameof(task));
            }

            if (string.IsNullOrWhiteSpace(task.AssignedTo))
            {
                throw new ArgumentException("AssignedTo is required.", nameof(task));
            }

            if (task.Title.Length > 100)
            {
                throw new ArgumentException("Title cannot exceed 100 characters.", nameof(task));
            }

            if (!string.IsNullOrWhiteSpace(task.Description) && task.Description.Length > 500)
            {
                throw new ArgumentException("Description cannot exceed 500 characters.", nameof(task));
            }

            if (task.AssignedTo.Length > 50)
            {
                throw new ArgumentException("AssignedTo cannot exceed 50 characters.", nameof(task));
            }
        }
    }
} 