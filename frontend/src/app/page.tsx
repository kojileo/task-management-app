'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import taskApi from '@/lib/taskApi';
import { TaskItem, TaskFormData, TaskStatus } from '@/types/task';

export default function Home() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskApi.getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error('タスク取得エラー:', error);
      toast.error('タスクの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      const createdTask = await taskApi.createTask(formData);
      setTasks(prevTasks => [...prevTasks, createdTask]);
      toast.success('タスクを作成しました');
      setShowForm(false);
    } catch (error) {
      console.error('タスク作成エラー:', error);
      toast.error('タスクの作成に失敗しました');
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask) return;
    try {
      const updatedTask = await taskApi.updateTask(editingTask.id, { ...editingTask, ...formData });
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
      );
      toast.success('タスクを更新しました');
      setEditingTask(null);
    } catch (error) {
      console.error('タスク更新エラー:', error);
      toast.error('タスクの更新に失敗しました');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await taskApi.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      toast.success('タスクを削除しました');
    } catch (error) {
      console.error('タスク削除エラー:', error);
      toast.error('タスクの削除に失敗しました');
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = await taskApi.updateTask(taskId, {
          id: taskId,
          title: task.title,
          description: task.description,
          assignedTo: task.assignedTo,
          dueDate: task.dueDate,
          status: newStatus,
        });
        setTasks(prevTasks =>
          prevTasks.map(t => (t.id === taskId ? updatedTask : t))
        );
        toast.success('タスクのステータスを更新しました');
      }
    } catch (error) {
      toast.error('タスクのステータス更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500" data-testid="loading-message">タスクを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">タスク管理</h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            新規タスク
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <TaskForm onSubmit={handleCreateTask} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {editingTask && (
          <div className="mb-8">
            <TaskForm
              task={editingTask}
              onSubmit={handleUpdateTask}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        )}

        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
