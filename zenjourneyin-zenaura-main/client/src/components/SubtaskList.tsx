import React, { useState } from 'react';
import { useFirebaseSubtasks } from '../hooks/useFirebaseSubtasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have a Checkbox component
import { Trash2, Edit3, Plus, Save } from 'lucide-react'; // Edit3 for edit icon, Save for save icon
import { Subtask } from '../pages/Index'; // Import Subtask interface

interface SubtaskListProps {
  userId: string;
  taskId: string;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ userId, taskId }) => {
  const { subtasks, loading, error, addSubtask, toggleSubtask, deleteSubtask, updateSubtaskName } = useFirebaseSubtasks(userId, taskId);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskName, setEditingSubtaskName] = useState('');

  const handleAddSubtask = async () => {
    if (newSubtaskName.trim()) {
      try {
        await addSubtask(newSubtaskName.trim());
        setNewSubtaskName('');
      } catch (err) {
        console.error("Failed to add subtask:", err);
        // Potentially show a toast message to the user
      }
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtask(subtaskId);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId);
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskName(subtask.name);
  };

  const handleSaveSubtaskName = async (subtaskId: string) => {
    if (editingSubtaskName.trim() && editingSubtaskId === subtaskId) {
      try {
        await updateSubtaskName(subtaskId, editingSubtaskName.trim());
        setEditingSubtaskId(null);
        setEditingSubtaskName('');
      } catch (err) {
        console.error("Failed to update subtask name:", err);
      }
    }
  };


  if (loading) return <div className="p-4 text-sm text-gray-500">Loading subtasks...</div>;
  if (error) return <div className="p-4 text-sm text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md mt-2">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subtasks:</h4>
      <div className="flex space-x-2">
        <Input
          type="text"
          value={newSubtaskName}
          onChange={(e) => setNewSubtaskName(e.target.value)}
          placeholder="Add a new subtask..."
          className="flex-grow h-9 text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
        />
        <Button onClick={handleAddSubtask} size="sm" className="h-9 interactive-primary">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
      {subtasks.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">No subtasks yet.</p>
      ) : (
        <ul className="space-y-2">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-700 rounded shadow-sm">
              <Checkbox
                id={`subtask-${subtask.id}`}
                checked={subtask.completed}
                onCheckedChange={() => handleToggleSubtask(subtask.id)}
                aria-label={`Mark subtask ${subtask.name} as ${subtask.completed ? 'incomplete' : 'complete'}`}
              />
              {editingSubtaskId === subtask.id ? (
                <Input
                  type="text"
                  value={editingSubtaskName}
                  onChange={(e) => setEditingSubtaskName(e.target.value)}
                  className="flex-grow h-8 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveSubtaskName(subtask.id)}
                  onBlur={() => handleSaveSubtaskName(subtask.id)} // Save on blur as well
                  autoFocus
                />
              ) : (
                <label
                  htmlFor={`subtask-${subtask.id}`}
                  className={`flex-grow text-sm cursor-pointer ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                >
                  {subtask.name}
                </label>
              )}
              {editingSubtaskId === subtask.id ? (
                 <Button variant="ghost" size="iconSm" onClick={() => handleSaveSubtaskName(subtask.id)} aria-label="Save subtask name">
                    <Save className="w-4 h-4 text-green-600" />
                  </Button>
              ) : (
                <Button variant="ghost" size="iconSm" onClick={() => handleEditSubtask(subtask)} aria-label="Edit subtask name">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                </Button>
              )}
              <Button variant="ghost" size="iconSm" onClick={() => handleDeleteSubtask(subtask.id)} aria-label="Delete subtask">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
