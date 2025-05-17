using Microsoft.AspNetCore.Mvc;
using TaskManagement.API.Models;
using TaskManagement.API.Services;
using System.Text.Json;

namespace TaskManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetAll()
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskItem>> GetById(int id)
        {
            var task = await _taskService.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            
            // JSONプロパティを明示的に設定
            var responseObj = new
            {
                id = task.Id,
                title = task.Title,
                description = task.Description,
                status = (int)task.Status,
                dueDate = task.DueDate,
                assignedTo = task.AssignedTo,
                createdAt = task.CreatedAt,
                updatedAt = task.UpdatedAt
            };
            
            return Ok(responseObj);
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> Create([FromBody] TaskItem task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var createdTask = await _taskService.CreateTaskAsync(task);
                
                // JSONプロパティを明示的に設定
                var responseObj = new
                {
                    id = createdTask.Id,
                    title = createdTask.Title,
                    description = createdTask.Description,
                    status = (int)createdTask.Status,
                    dueDate = createdTask.DueDate,
                    assignedTo = createdTask.AssignedTo,
                    createdAt = createdTask.CreatedAt,
                    updatedAt = createdTask.UpdatedAt
                };
                
                return StatusCode(201, responseObj);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TaskItem>> Update(int id, [FromBody] TaskItem task)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != task.Id)
            {
                return BadRequest(new { message = "ID in the request body does not match the ID in the URL." });
            }

            try
            {
                var updatedTask = await _taskService.UpdateTaskAsync(task);
                
                // JSONプロパティを明示的に設定し、statusを数値として返す
                var responseObj = new
                {
                    id = updatedTask.Id,
                    title = updatedTask.Title,
                    description = updatedTask.Description,
                    status = (int)updatedTask.Status,
                    dueDate = updatedTask.DueDate,
                    assignedTo = updatedTask.AssignedTo,
                    createdAt = updatedTask.CreatedAt,
                    updatedAt = updatedTask.UpdatedAt
                };
                
                return Ok(responseObj);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            Console.WriteLine($"タスク削除リクエスト受信: ID = {id}");
            try
            {
                await _taskService.DeleteTaskAsync(id);
                Console.WriteLine($"タスク削除成功: ID = {id}");
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                Console.WriteLine($"タスクが見つかりません: ID = {id}");
                return NotFound();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"タスク削除エラー: ID = {id}, エラー = {ex.Message}");
                return StatusCode(500, new { message = "タスクの削除中にエラーが発生しました" });
            }
        }
    }
} 