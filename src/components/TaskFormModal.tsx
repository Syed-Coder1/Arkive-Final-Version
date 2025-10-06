import React from 'react';
import ReactDOM from 'react-dom';
import { 
  X, 
  Target, 
  FileText, 
  Plus, 
  Trash2,
  Flag
} from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';

interface TaskFormModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    title: string;
    description: string;
    assignedTo: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: string;
    documentsRequired: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    assignedTo: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: string;
    documentsRequired: string[];
  }>>;
  editingTask: any;
  resetForm: () => void;
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    urgent: 'bg-red-600 text-white border-red-700',
    high: 'bg-orange-500 text-white border-orange-700',
    medium: 'bg-yellow-400 text-gray-900 border-yellow-600',
    low: 'bg-green-500 text-white border-green-700',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingTask,
  resetForm
}) => {
  const { employees } = useDatabase();

  if (!show) return null;

  // Document chips UX
  const addDocumentField = () => {
    setFormData({
      ...formData,
      documentsRequired: [...formData.documentsRequired, '']
    });
  };
  const removeDocumentField = (index: number) => {
    const newDocs = formData.documentsRequired.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      documentsRequired: newDocs.length === 0 ? [''] : newDocs
    });
  };
  const updateDocumentField = (index: number, value: string) => {
    const newDocs = [...formData.documentsRequired];
    newDocs[index] = value;
    setFormData({
      ...formData,
      documentsRequired: newDocs
    });
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={() => {
        resetForm();
        onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200/20 dark:border-gray-700/30 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {editingTask ? 'Edit Task' : 'New Task'}
            </span>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col px-6 py-5 gap-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Assignment & Deadline */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assign to
              </label>
              <select
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`px-3 py-1 rounded-lg border text-sm font-semibold capitalize flex items-center gap-1
                    ${formData.priority === priority
                      ? getPriorityColor(priority) + ' border-2 shadow'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <Flag className={`w-4 h-4 ${
                    priority === 'urgent' ? 'text-white' :
                    priority === 'high' ? 'text-white' :
                    priority === 'medium' ? 'text-gray-900' :
                    'text-white'
                  }`} />
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Required Documents
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.documentsRequired.map((doc, idx) => (
                <span key={idx} className="flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                  <FileText className="w-4 h-4 mr-1" />
                  <input
                    type="text"
                    value={doc}
                    onChange={e => updateDocumentField(idx, e.target.value)}
                    placeholder={`Document ${idx + 1}`}
                    className="bg-transparent border-none outline-none text-sm w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeDocumentField(idx)}
                    className="ml-1 text-red-400 hover:text-red-600"
                    tabIndex={-1}
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={addDocumentField}
                className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200 rounded-full border border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                title="Add document"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-5 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
            >
              {editingTask ? <Target className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.getElementById('modal-root')!);
};

export default TaskFormModal;