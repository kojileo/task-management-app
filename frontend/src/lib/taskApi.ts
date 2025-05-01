import { TaskItem, TaskFormData } from '@/types/task';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    const requestBody = {
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: new Date(task.dueDate + 'T00:00:00Z').toISOString(),
      assignedTo: task.assignedTo,
    };

    console.log('リクエストボディ:', requestBody);

    const response = await fetch(`${API_BASE_URL}/api/Task`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('エラーレスポンス:', error);
      throw new Error(error || 'タスクの作成に失敗しました');
    }

    return response.json();
  },

  async updateTask(id: number, task: TaskItem): Promise<TaskItem> {
    const requestBody = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: new Date(task.dueDate + 'T00:00:00Z').toISOString(),
      assignedTo: task.assignedTo,
    };

    console.log('リクエストボディ:', requestBody);

    const response = await fetch(`${API_BASE_URL}/api/Task/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('エラーレスポンス:', error);
      throw new Error(error || 'タスクの更新に失敗しました');
    }

    return response.json();
  },

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Task/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.text();
      console.error('エラーレスポンス:', error);
      throw new Error(error || 'タスクの削除に失敗しました');
    }
  },
};
