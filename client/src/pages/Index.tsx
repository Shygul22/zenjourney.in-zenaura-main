import React, { useState } from 'react';
import { TaskList } from '../components/TaskList';
import { TimeBlocking } from '../components/TimeBlocking';
import { Settings } from '../components/Settings';
import { Header } from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useClearAllTasks, DatabaseTask } from '../hooks/useTasks';
import { useSettings, useUpdateSettings, DatabaseSettings } from '../hooks/useSettings';
import { CheckSquare, Calendar, Settings as SettingsIcon, Menu, X, LogOut } from 'lucide-react';

export interface Task {
  id: string;
  name: string;
  priority: number;
  effort: number;
  completed: boolean;
  createdAt: Date;
  priorityScore: number;
  scheduledStart?: Date;
  scheduledEnd?: Date;
}

export interface WorkdaySettings {
  startTime: string;
  endTime: string;
  breakDuration: number;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { user, dbUser, signOut } = useAuth();
  
  // Database hooks
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useTasks(dbUser?.id);
  const { data: settings, isLoading: settingsLoading } = useSettings(dbUser?.id);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const clearAllTasks = useClearAllTasks();
  const updateSettings = useUpdateSettings();

  const isLoading = tasksLoading || settingsLoading;

  // Convert database tasks to component format
  const convertedTasks: Task[] = tasks.map((task: DatabaseTask) => ({
    id: task.id.toString(),
    name: task.name,
    priority: task.priority,
    effort: task.effort,
    completed: task.completed,
    priorityScore: parseFloat(task.priorityScore),
    createdAt: new Date(task.createdAt),
    scheduledStart: task.scheduledStart ? new Date(task.scheduledStart) : undefined,
    scheduledEnd: task.scheduledEnd ? new Date(task.scheduledEnd) : undefined,
  }));

  // Convert database settings to component format
  const workdaySettings: WorkdaySettings = settings ? {
    startTime: settings.startTime,
    endTime: settings.endTime,
    breakDuration: settings.breakDuration,
  } : {
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 15,
  };

  const addTask = async (name: string, priority: number, effort: number) => {
    if (!dbUser?.id) return;
    
    try {
      await createTask.mutateAsync({ name, priority, effort, userId: dbUser.id });
      toast({
        title: "Task Added",
        description: `"${name}" has been added to your task list`,
      });
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleTask = async (id: string) => {
    if (!dbUser?.id) return;
    
    try {
      const task = convertedTasks.find(t => t.id === id);
      if (task) {
        await updateTask.mutateAsync({
          id: parseInt(id),
          updates: { completed: !task.completed },
          userId: dbUser.id
        });
        
        if (!task.completed) {
          toast({
            title: "Task Completed",
            description: `Great job completing "${task.name}"!`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteTaskHandler = async (id: string) => {
    if (!dbUser?.id) return;
    
    try {
      const taskToDelete = convertedTasks.find(task => task.id === id);
      await deleteTask.mutateAsync({ id: parseInt(id), userId: dbUser.id });
      
      toast({
        title: "Task Deleted",
        description: `"${taskToDelete?.name}" has been removed from your list`,
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearAllTasksHandler = async () => {
    if (!dbUser?.id) return;
    
    try {
      await clearAllTasks.mutateAsync(dbUser.id);
      toast({
        title: "All Tasks Cleared",
        description: "Your task list has been cleared",
      });
    } catch (error) {
      console.error('Error clearing tasks:', error);
      toast({
        title: "Error",
        description: "Failed to clear tasks. Please try again.",
        variant: "destructive"
      });
    }
  };

  const rescheduleTask = async (taskId: string, newStart: Date, newEnd: Date) => {
    if (!dbUser?.id) return;
    
    try {
      await updateTask.mutateAsync({
        id: parseInt(taskId),
        updates: { 
          scheduledStart: newStart.toISOString(),
          scheduledEnd: newEnd.toISOString()
        },
        userId: dbUser.id
      });
    } catch (error) {
      console.error('Error rescheduling task:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateWorkdaySettings = async (newSettings: WorkdaySettings) => {
    if (!dbUser?.id) return;
    
    try {
      await updateSettings.mutateAsync({
        userId: dbUser.id,
        startTime: newSettings.startTime,
        endTime: newSettings.endTime,
        breakDuration: newSettings.breakDuration,
      });
      toast({
        title: "Settings Updated",
        description: "Your workday settings have been saved",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const tabConfig = [
    {
      value: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      description: 'Manage your task list'
    },
    {
      value: 'timeblocking',
      label: 'Schedule',
      icon: Calendar,
      description: 'View your time blocks'
    },
    {
      value: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      description: 'Configure your workday'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-lg font-medium text-gray-700">Loading ZenJourney...</div>
          <div className="text-sm text-gray-500">Preparing your productivity workspace</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="glass shadow-lg"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Navigation</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.value 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="container-responsive py-6 safe-top safe-bottom">
        <Header />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Desktop Navigation */}
            <TabsList className="hidden lg:grid w-full grid-cols-3 mb-6 glass shadow-lg h-16">
              {tabConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:gradient-primary data-[state=active]:text-white transition-all duration-300 h-12 flex items-center space-x-2 text-sm font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Mobile Navigation */}
            <div className="lg:hidden mb-6">
              <div className="glass rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const currentTab = tabConfig.find(tab => tab.value === activeTab);
                      const Icon = currentTab?.icon || CheckSquare;
                      return (
                        <>
                          <Icon className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{currentTab?.label}</div>
                            <div className="text-xs text-gray-500">{currentTab?.description}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tabConfig.findIndex(tab => tab.value === activeTab) + 1} of {tabConfig.length}
                  </div>
                </div>
              </div>
            </div>
            
            <TabsContent value="tasks" className="animate-fade-in">
              <TaskList
                tasks={convertedTasks}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTaskHandler}
                onClearAll={clearAllTasksHandler}
              />
            </TabsContent>
            
            <TabsContent value="timeblocking" className="animate-fade-in">
              <TimeBlocking
                tasks={convertedTasks}
                workdaySettings={workdaySettings}
                onRescheduleTask={rescheduleTask}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="animate-fade-in">
              <Settings
                settings={workdaySettings}
                onUpdateSettings={updateWorkdaySettings}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" id="status-announcements"></div>
      
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      <main id="main-content" className="sr-only">
        Main content area for screen readers
      </main>
    </div>
  );
};

export default Index;