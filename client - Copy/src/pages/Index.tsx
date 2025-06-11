import React, { useState } from 'react';
import { TaskList } from '../components/TaskList';
import { TimeBlocking } from '../components/TimeBlocking';
import { Settings } from '../components/Settings';
import { Header } from '../components/Header';
import { UserProfileCard } from '../components/UserProfile';
import { DataMigration } from '../components/DataMigration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useFirebaseTasks, useFirebaseSettings } from '../hooks/useFirestore';
import { useFirebaseProfile } from '../hooks/useFirebaseProfile';
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
  const { user, signOut } = useAuth();
  
  // Firebase hooks
  const { 
    profile,
    loading: profileLoading,
    updateStats
  } = useFirebaseProfile(user as any);
  
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError, 
    syncStatus,
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTask, 
    rescheduleTask: rescheduleFirebaseTask, 
    clearAllTasks 
  } = useFirebaseTasks(user?.uid);
  
  const { 
    settings, 
    loading: settingsLoading, 
    updateSettings 
  } = useFirebaseSettings(user?.uid);

  const isLoading = tasksLoading || settingsLoading || profileLoading;

  const handleAddTask = async (name: string, priority: number, effort: number) => {
    if (!user?.uid) return;
    
    try {
      await addTask(name, priority, effort);
      // Update user stats
      if (updateStats) {
        await updateStats({ 
          totalTasks: (profile?.stats.totalTasks || 0) + 1 
        });
      }
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

  const handleToggleTask = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      const task = tasks.find(t => t.id === id);
      await toggleTask(id);
      
      if (task && !task.completed) {
        // Update user stats
        if (updateStats) {
          await updateStats({ 
            completedTasks: (profile?.stats.completedTasks || 0) + 1 
          });
        }
        toast({
          title: "Task Completed",
          description: `Great job completing "${task.name}"!`,
        });
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

  const handleDeleteTask = async (id: string) => {
    if (!user?.uid) return;
    
    try {
      const task = tasks.find(task => task.id === id);
      await deleteTask(id);
      toast({
        title: "Task Deleted",
        description: `"${task?.name}" has been removed from your task list`,
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

  const handleClearAll = async () => {
    if (!user?.uid) return;
    
    try {
      await clearAllTasks();
      toast({
        title: "All Tasks Cleared",
        description: "All tasks have been removed from your list",
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

  const handleRescheduleTask = async (taskId: string, newStart: Date, newEnd: Date) => {
    if (!user?.uid) return;
    
    try {
      await rescheduleFirebaseTask(taskId, newStart, newEnd);
      toast({
        title: "Task Rescheduled",
        description: "Task has been moved to the new time slot",
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

  const handleUpdateSettings = async (newSettings: WorkdaySettings) => {
    if (!user?.uid) return;
    
    try {
      await updateSettings(newSettings);
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

  const handleMigrateToFirebase = async () => {
    if (!user?.uid || !user.uid.startsWith('demo-user-')) {
      toast({
        title: "Migration Not Available",
        description: "Migration is only available for demo accounts.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get local storage data
      const localTasks = JSON.parse(localStorage.getItem('zenjourney-demo-tasks') || '[]');
      const localSettings = JSON.parse(localStorage.getItem('zenjourney-demo-settings') || '{}');
      
      if (localTasks.length === 0) {
        toast({
          title: "No Data to Migrate",
          description: "No local tasks found to migrate.",
          variant: "destructive"
        });
        return;
      }

      // Would require user to sign in with Google first
      toast({
        title: "Migration Requires Firebase Account",
        description: "Please sign in with Google to migrate your data to Firebase.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: "Failed to migrate data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportData = async () => {
    const data = {
      tasks: tasks,
      settings: settings,
      profile: profile,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zenjourney-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if user has local data
  const hasLocalData = user?.uid?.startsWith('demo-user-') && tasks.length > 0;

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading your workspace...</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Setting up tasks and settings</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* User Profile Section */}
          <div className="mb-6">
            <UserProfileCard profile={profile} syncStatus={syncStatus} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 shadow-sm">
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="schedule" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className="mt-6">
                <TaskList
                  tasks={tasks}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onClearAll={handleClearAll}
                />
              </TabsContent>
              
              <TabsContent value="schedule" className="mt-6">
                <TimeBlocking
                  tasks={tasks}
                  workdaySettings={settings}
                  onRescheduleTask={handleRescheduleTask}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <div className="space-y-6">
                  <Settings
                    settings={settings}
                    onUpdateSettings={handleUpdateSettings}
                  />
                  
                  <DataMigration
                    onMigrateToFirebase={handleMigrateToFirebase}
                    onExportData={handleExportData}
                    hasLocalData={hasLocalData}
                    isFirebaseConnected={!(user?.uid?.startsWith('demo-user-') ?? true)}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={activeTab === 'tasks' ? 'default' : 'outline'}
                onClick={() => setActiveTab('tasks')}
                className="flex items-center gap-2 flex-1"
              >
                <CheckSquare className="w-4 h-4" />
                Tasks
              </Button>
              <Button
                variant={activeTab === 'schedule' ? 'default' : 'outline'}
                onClick={() => setActiveTab('schedule')}
                className="flex items-center gap-2 flex-1"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
              <Button
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-2 flex-1"
              >
                <SettingsIcon className="w-4 h-4" />
                Settings
              </Button>
            </div>

            {activeTab === 'tasks' && (
              <TaskList
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onClearAll={handleClearAll}
              />
            )}
            
            {activeTab === 'schedule' && (
              <TimeBlocking
                tasks={tasks}
                workdaySettings={settings}
                onRescheduleTask={handleRescheduleTask}
              />
            )}
            
            {activeTab === 'settings' && (
              <Settings
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;