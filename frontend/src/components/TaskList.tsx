'use client';

import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

import { TaskItem, TaskStatus } from '@/types/task';

interface TaskListProps {
  tasks: TaskItem[];
  loading: boolean;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: number) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void;
}

const statusColors = {
  [TaskStatus.NotStarted]: 'bg-blue-100 text-blue-800',
  [TaskStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
  [TaskStatus.Completed]: 'bg-green-100 text-green-800',
};

const statusLabels = {
  [TaskStatus.NotStarted]: '未着手',
  [TaskStatus.InProgress]: '進行中',
  [TaskStatus.Completed]: '完了',
};

function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: TaskItem;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(task);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 mb-3"
    >
      <div className="flex justify-between items-start">
        <div {...listeners} className="cursor-move flex-grow">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <p className="text-gray-600 text-sm mt-2">{task.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              期限: {new Date(task.dueDate).toLocaleDateString()}
            </span>
            <span className="text-sm text-gray-500">担当: {task.assignedTo}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TaskList({
  tasks,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const taskId = active.id as number;
      const newStatus = over.id as TaskStatus;
      onStatusChange(taskId, newStatus);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-white rounded-lg p-4 mb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.values(TaskStatus).map(status => (
          <div key={status} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{statusLabels[status]}</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}
              >
                {tasks.filter(t => t.status === status).length}
              </span>
            </div>
            <SortableContext
              items={tasks.filter(t => t.status === status).map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks
                .filter(t => t.status === status)
                .map(task => (
                  <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
                ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
