import { TaskItem, TaskFormData } from '@/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

export default {
  async getAllTasks(): Promise<TaskItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/Task`);
    if (!response.ok) {
      throw new Error('タスクの取得に失敗しました');
    }
    return response.json();
  },

  async getTaskById(id: number): Promise<TaskItem> {
    const response = await fetch(`${API_BASE_URL}/api/Task/${id}`);
    if (!response.ok) {
      throw new Error('タスクの取得に失敗しました');
    }
    return response.json();
  },

  async createTask(task: TaskFormData): Promise<TaskItem> {
    try {
      const requestBody = {
        title: task.title,
        description: task.description,
        status: task.status || 'InProgress',
        dueDate: new Date(task.dueDate + 'T00:00:00Z').toISOString(),
        assignedTo: task.assignedTo,
      };

      const response = await fetch(`${API_BASE_URL}/api/Task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('タスクの作成に失敗しました');
      }

      const responseText = await response.text();
      if (!responseText) {
        const location = response.headers.get('location');
        if (location) {
          const taskId = location.split('/').pop();
          return this.getTaskById(Number(taskId));
        }
        throw new Error('タスクの作成に失敗しました：レスポンスが空です');
      }

      const responseData = JSON.parse(responseText);
      return {
        id: responseData.Id,
        title: responseData.Title,
        description: responseData.Description,
        status: responseData.Status,
        dueDate: responseData.DueDate,
        assignedTo: responseData.AssignedTo,
      };
    } catch (error) {
      console.error('タスク作成エラー:', error);
      throw new Error('タスクの作成に失敗しました');
    }
  },

  async updateTask(id: number, task: TaskItem): Promise<TaskItem> {
    try {
      const requestBody = {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
      };

      const response = await fetch(`${API_BASE_URL}/api/Task/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`タスクの更新に失敗しました: ${response.statusText}`);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error('タスクの更新に失敗しました：レスポンスが空です');
      }

      const responseData = JSON.parse(responseText);
      return {
        id: responseData.Id,
        title: responseData.Title,
        description: responseData.Description,
        status: responseData.Status,
        dueDate: responseData.DueDate,
        assignedTo: responseData.AssignedTo,
      };
    } catch (error) {
      console.error('タスク更新エラー:', error);
      throw error;
    }
  },

  async deleteTask(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Task/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`タスクの削除に失敗しました: ${response.statusText}`);
      }
    } catch (error) {
      console.error('タスク削除エラー:', error);
      throw error;
    }
  },
};
