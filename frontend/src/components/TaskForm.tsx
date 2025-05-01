'use client';

import { useState } from 'react';

import { TaskItem, TaskFormData, TaskStatus } from '@/types/task';

interface TaskFormProps {
  task?: TaskItem;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

const statusLabels = {
  [TaskStatus.NotStarted]: '未着手',
  [TaskStatus.InProgress]: '進行中',
  [TaskStatus.Completed]: '完了',
};

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const currentDate = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || TaskStatus.NotStarted,
    dueDate: task && task.dueDate ? task.dueDate : currentDate,
    assignedTo: task?.assignedTo || '',
  });

  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 日付のバリデーション
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('期限は今日以降の日付を選択してください');
      return;
    }

    // デバッグ用のログ
    console.log('送信するデータ:', {
      ...formData,
      status: Number(formData.status),
      dueDate: new Date(formData.dueDate + 'T00:00:00Z').toISOString(),
    });

    setError('');
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-lg">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          ステータス
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          期限
        </label>
        <input
          type="date"
          id="dueDate"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min={currentDate}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
          担当者
        </label>
        <input
          type="text"
          id="assignedTo"
          value={formData.assignedTo}
          onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {task ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
}
