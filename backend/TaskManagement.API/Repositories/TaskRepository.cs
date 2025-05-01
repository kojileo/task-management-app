using TaskManagement.API.Models;

namespace TaskManagement.API.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly List<TaskItem> _tasks;
        private int _nextId = 1;

        public TaskRepository()
        {
            _tasks = new List<TaskItem>
            {
                new TaskItem
                {
                    Id = _nextId++,
                    Title = "サンプルタスク1",
                    Description = "これはサンプルタスクです",
                    Status = Models.TaskStatus.NotStarted,
                    DueDate = DateTime.Today.AddDays(7),
                    AssignedTo = "ユーザー1"
                },
                new TaskItem
                {
                    Id = _nextId++,
                    Title = "サンプルタスク2",
                    Description = "これは2つ目のサンプルタスクです",
                    Status = Models.TaskStatus.InProgress,
                    DueDate = DateTime.Today.AddDays(3),
                    AssignedTo = "ユーザー2"
                }
            };
        }

        public Task<IEnumerable<TaskItem>> GetAllAsync()
        {
            return Task.FromResult<IEnumerable<TaskItem>>(_tasks);
        }

        public Task<TaskItem?> GetByIdAsync(int id)
        {
            return Task.FromResult(_tasks.FirstOrDefault(t => t.Id == id));
        }

        public Task<TaskItem> CreateAsync(TaskItem task)
        {
            task.Id = _nextId++;
            _tasks.Add(task);
            return Task.FromResult(task);
        }

        public Task<TaskItem> UpdateAsync(TaskItem task)
        {
            var existingTask = _tasks.FirstOrDefault(t => t.Id == task.Id);
            if (existingTask == null)
            {
                throw new KeyNotFoundException($"Task with ID {task.Id} not found.");
            }

            existingTask.Title = task.Title;
            existingTask.Description = task.Description;
            existingTask.Status = task.Status;
            existingTask.DueDate = task.DueDate;
            existingTask.AssignedTo = task.AssignedTo;

            return Task.FromResult(existingTask);
        }

        public Task DeleteAsync(int id)
        {
            var task = _tasks.FirstOrDefault(t => t.Id == id);
            if (task == null)
            {
                throw new KeyNotFoundException($"Task with ID {id} not found.");
            }

            _tasks.Remove(task);
            return Task.CompletedTask;
        }
    }
} 