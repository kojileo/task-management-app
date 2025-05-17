using System.ComponentModel.DataAnnotations;

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

        [Required(ErrorMessage = "タイトルは必須です")]
        [StringLength(100, ErrorMessage = "タイトルは100文字以内で入力してください")]
        public string Title { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "説明は500文字以内で入力してください")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "ステータスは必須です")]
        public TaskStatus Status { get; set; }

        [Required(ErrorMessage = "期限日は必須です")]
        public DateTime DueDate { get; set; }

        [Required(ErrorMessage = "担当者は必須です")]
        [StringLength(50, ErrorMessage = "担当者名は50文字以内で入力してください")]
        public string AssignedTo { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
} 