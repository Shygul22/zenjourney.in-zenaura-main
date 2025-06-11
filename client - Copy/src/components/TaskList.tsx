import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, CheckCircle, Circle, Clock, TrendingUp, Filter, Search, AlertCircle } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = async () => {
    if (newTaskName.trim()) {
      setIsAddingTask(true);
      try {
        await onAddTask(newTaskName.trim(), newTaskPriority, newTaskEffort);
        setNewTaskName('');
        setNewTaskPriority(3);
        setNewTaskEffort(2);
      } catch (error) {
        console.error('Failed to add task:', error);
      } finally {
        setTimeout(() => setIsAddingTask(false), 300);
      }
    }
  };

  const getPriorityConfig = (priority: number) => {
    if (priority >= 5) return {
      color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      label: 'Critical',
      icon: '🔴'
    };
    if (priority >= 4) return {
      color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
      label: 'High',
      icon: '🟠'
    };
    if (priority >= 3) return {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      label: 'Medium',
      icon: '🟡'
    };
    return {
      color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      label: 'Low',
      icon: '🟢'
    };
  };

  const filteredTasks = tasks
    .filter(task => {
      const matchesFilter = filter === 'all' || 
        (filter === 'pending' && !task.completed) || 
        (filter === 'completed' && task.completed);
      const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    highPriority: tasks.filter(t => !t.completed && t.priority >= 4).length
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Task Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="card-elevated p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{taskStats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Total Tasks</div>
        </Card>
        <Card className="card-elevated p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-orange-600">{taskStats.pending}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Pending</div>
        </Card>
        <Card className="card-elevated p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-green-600">{taskStats.completed}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Completed</div>
        </Card>
        <Card className="card-elevated p-4 text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">{taskStats.highPriority}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">High Priority</div>
        </Card>
      </div>

      {/* Add New Task */}
      <Card className="card-elevated">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Plus className="w-5 h-5 text-blue-600" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="taskName" className="text-sm font-medium">
              Task Name <span className="text-red-500" aria-label="required">*</span>
            </Label>
            <Input
              id="taskName"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Enter your task description..."
              className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              aria-describedby="taskName-help"
            />
            <p id="taskName-help" className="text-xs text-gray-500">
              Be specific about what you want to accomplish
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Priority Level: <span className="font-bold text-blue-600">{newTaskPriority}</span>
              </Label>
              <Slider
                value={[newTaskPriority]}
                onValueChange={(value) => setNewTaskPriority(value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
                aria-label="Task priority level"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 - Low</span>
                <span>3 - Medium</span>
                <span>5 - Critical</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Effort Required: <span className="font-bold text-purple-600">{newTaskEffort}h</span>
              </Label>
              <Slider
                value={[newTaskEffort]}
                onValueChange={(value) => setNewTaskEffort(value[0])}
                max={8}
                min={0.5}
                step={0.5}
                className="w-full"
                aria-label="Task effort in hours"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5h</span>
                <span>4h</span>
                <span>8h</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAddTask} 
            disabled={!newTaskName.trim() || isAddingTask}
            className="w-full interactive-primary h-12 text-base font-medium"
          >
            {isAddingTask ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding Task...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Task</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Filter and Search Controls */}
      <Card className="card-elevated">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                  aria-label="Search tasks"
                />
              </div>
              
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-full sm:w-48 glass">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks ({taskStats.total})</SelectItem>
                  <SelectItem value="pending">Pending ({taskStats.pending})</SelectItem>
                  <SelectItem value="completed">Completed ({taskStats.completed})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {tasks.length > 0 && (
              <Button 
                variant="outline" 
                onClick={onClearAll}
                className="w-full sm:w-auto glass hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="card-elevated border-dashed border-2">
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                {searchQuery ? (
                  <>
                    <Search className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-600">No tasks found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </>
                ) : filter === 'pending' ? (
                  <>
                    <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-600">All caught up!</p>
                      <p className="text-sm text-gray-500 mt-1">
                        No pending tasks. Great job staying productive!
                      </p>
                    </div>
                  </>
                ) : filter === 'completed' ? (
                  <>
                    <Circle className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-600">No completed tasks yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete some tasks to see them here
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-600">No tasks yet</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Add your first task above to get started!
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task, index) => {
            const priorityConfig = getPriorityConfig(task.priority);
            return (
              <Card 
                key={task.id} 
                className={`card-elevated transition-all duration-300 ${
                  task.completed ? 'opacity-75 bg-gray-50' : ''
                } hover:shadow-xl`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-1 text-blue-500 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {task.completed ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-base sm:text-lg leading-tight ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {task.name}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                        <Badge 
                          className={`${priorityConfig.color} text-xs font-medium px-2 py-1`}
                          aria-label={`Priority: ${priorityConfig.label}`}
                        >
                          <span className="mr-1" aria-hidden="true">{priorityConfig.icon}</span>
                          {priorityConfig.label}
                        </Badge>
                        
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{task.effort}h</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                          <TrendingUp className="w-3 h-3" />
                          <span>Score: {Math.round(task.priorityScore)}</span>
                        </div>

                        {task.priority >= 4 && !task.completed && (
                          <div className="flex items-center space-x-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>High Priority</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label={`Delete task: ${task.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Results summary */}
      {searchQuery && (
        <div className="text-center text-sm text-gray-500 py-4">
          Showing {filteredTasks.length} of {tasks.length} tasks
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}
    </div>
  );
};