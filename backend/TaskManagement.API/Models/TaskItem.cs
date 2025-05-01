namespace TaskManagement.API.Models
{
    public enum TaskStatus
    {
        NotStarted,
        InProgress,
        Completed
    }

    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TaskStatus Status { get; set; }
        public DateTime DueDate { get; set; }
        public string AssignedTo { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 