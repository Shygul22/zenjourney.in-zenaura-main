import React, { useState } from 'react';
import { useFirebaseSubtasks } from '../hooks/useFirebaseSubtasks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit3, Plus, Save, X } from 'lucide-react';
import { Subtask } from '../pages/Index';
import { useToast } from '@/hooks/use-toast';

interface SubtaskListProps {
  userId: string;
  taskId: string;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ userId, taskId }) => {
  const { subtasks, loading, error, addSubtask, toggleSubtask, deleteSubtask, updateSubtaskName } = useFirebaseSubtasks(userId, taskId);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskName, setEditingSubtaskName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim()) return;
    
    setIsAdding(true);
    try {
      await addSubtask(newSubtaskName.trim());
      setNewSubtaskName('');
      toast({
        title: "Subtask Added",
        description: "New subtask has been added successfully.",
      });
    } catch (err) {
      console.error("Failed to add subtask:", err);
      toast({
        title: "Error",
        description: "Failed to add subtask. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtask(subtaskId);
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
      toast({
        title: "Error",
        description: "Failed to update subtask. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId);
      toast({
        title: "Subtask Deleted",
        description: "Subtask has been removed successfully.",
      });
    } catch (err) {
      console.error("Failed to delete subtask:", err);
      toast({
        title: "Error",
        description: "Failed to delete subtask. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskName(subtask.name);
  };

  const handleSaveSubtaskName = async (subtaskId: string) => {
    if (!editingSubtaskName.trim() || editingSubtaskId !== subtaskId) {
      setEditingSubtaskId(null);
      setEditingSubtaskName('');
      return;
    }

    try {
      await updateSubtaskName(subtaskId, editingSubtaskName.trim());
      setEditingSubtaskId(null);
      setEditingSubtaskName('');
      toast({
        title: "Subtask Updated",
        description: "Subtask name has been updated successfully.",
      });
    } catch (err) {
      console.error("Failed to update subtask name:", err);
      toast({
        title: "Error",
        description: "Failed to update subtask name. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskName('');
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
          onKeyPress={(e) => e.key === 'Enter' && !isAdding && handleAddSubtask()}
          disabled={isAdding}
        />
        <Button 
          onClick={handleAddSubtask} 
          size="sm" 
          className="h-9 interactive-primary"
          disabled={isAdding || !newSubtaskName.trim()}
        >
          <Plus className="w-4 h-4 mr-1" /> 
          {isAdding ? 'Adding...' : 'Add'}
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
                <div className="flex-grow flex items-center space-x-2">
                  <Input
                    type="text"
                    value={editingSubtaskName}
                    onChange={(e) => setEditingSubtaskName(e.target.value)}
                    className="flex-grow h-8 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveSubtaskName(subtask.id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                  />
                  <Button 
                    variant="ghost" 
                    size="iconSm" 
                    onClick={() => handleSaveSubtaskName(subtask.id)} 
                    aria-label="Save subtask name"
                    className="h-8 w-8"
                  >
                    <Save className="w-4 h-4 text-green-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="iconSm" 
                    onClick={handleCancelEdit} 
                    aria-label="Cancel edit"
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <label
                    htmlFor={`subtask-${subtask.id}`}
                    className={`flex-grow text-sm cursor-pointer ${subtask.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}
                  >
                    {subtask.name}
                  </label>
                  <Button 
                    variant="ghost" 
                    size="iconSm" 
                    onClick={() => handleEditSubtask(subtask)} 
                    aria-label="Edit subtask name"
                    className="h-8 w-8"
                  >
                    <Edit3 className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="iconSm" 
                    onClick={() => handleDeleteSubtask(subtask.id)} 
                    aria-label="Delete subtask"
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};