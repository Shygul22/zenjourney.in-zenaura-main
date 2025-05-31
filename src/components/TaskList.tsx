
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus, CheckCircle, Circle, Clock, TrendingUp } from 'lucide-react';
import { Task } from '../pages/Index';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (name: string, priority: number, effort: number) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onClearAll: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearAll
}) => {
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState(3);
  const [newTaskEffort, setNewTaskEffort] = useState(2);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      onAddTask(newTaskName.trim(), newTaskPriority, newTaskEffort);
      setNewTaskName('');
      setNewTaskPriority(3);
      setNewTaskEffort(2);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'text-red-600 bg-red-50 border-red-200';
    if (priority >= 4) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (priority >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 5) return 'Critical';
    if (priority >= 4) return 'High';
    if (priority >= 3) return 'Medium';
    return 'Low';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }).sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-6">
      {/* Add New Task */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter your task..."
              className="mt-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Priority Level: {newTaskPriority}</Label>
              <Slider
                value={[newTaskPriority]}
                onValueChange={(value) => setNewTaskPriority(value[0])}
                max={5}
                min={1}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Critical</span>
              </div>
            </div>
            
            <div>
              <Label>Effort (hours): {newTaskEffort}</Label>
              <Slider
                value={[newTaskEffort]}
                onValueChange={(value) => setNewTaskEffort(value[0])}
                max={8}
                min={0.5}
                step={0.5}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5h</span>
                <span>8h</span>
              </div>
            </div>
          </div>
          
          <Button onClick={handleAddTask} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            Add Task
          </Button>
        </CardContent>
      </Card>

      {/* Filter and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        
        {tasks.length > 0 && (
          <Button 
            variant="outline" 
            onClick={onClearAll}
            className="bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:border-red-200"
          >
            Clear All Tasks
          </Button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-dashed">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-2">
                <Circle className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">
                {filter === 'all' ? 'No tasks yet. Add your first task above!' : 
                 filter === 'pending' ? 'No pending tasks!' : 'No completed tasks yet!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                task.completed ? 'opacity-75' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                        {task.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.effort}h
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Score: {Math.round(task.priorityScore)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
