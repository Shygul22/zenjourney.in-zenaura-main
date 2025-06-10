import React, { useState, useEffect } from 'react';
import { TaskList } from '../components/TaskList';
import { TimeBlocking } from '../components/TimeBlocking';
import { Settings } from '../components/Settings';
import { Header } from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Calendar, Settings as SettingsIcon, Menu, X } from 'lucide-react';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workdaySettings, setWorkdaySettings] = useState<WorkdaySettings>({
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 15
  });
  const [activeTab, setActiveTab] = useState('tasks');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTasks = localStorage.getItem('zenjourney-tasks');
        const savedSettings = localStorage.getItem('zenjourney-settings');
        
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
            ...task,
            createdAt: new Date(task.createdAt),
            scheduledStart: task.scheduledStart ? new Date(task.scheduledStart) : undefined,
            scheduledEnd: task.scheduledEnd ? new Date(task.scheduledEnd) : undefined,
          }));
          setTasks(parsedTasks);
        }
        
        if (savedSettings) {
          setWorkdaySettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load saved data. Starting fresh.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('zenjourney-tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoading]);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('zenjourney-settings', JSON.stringify(workdaySettings));
    }
  }, [workdaySettings, isLoading]);

  const calculatePriorityScore = (priority: number, effort: number, createdAt: Date): number => {
    const urgencyScore = priority * 20; // 20-100 based on priority
    const timeDecay = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)); // Days since creation
    const effortPenalty = Math.max(0, (effort - 1) * 5); // Penalty for longer tasks
    
    return Math.max(0, urgencyScore + timeDecay * 2 - effortPenalty);
  };

  const addTask = (name: string, priority: number, effort: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      priority,
      effort,
      completed: false,
      createdAt: new Date(),
      priorityScore: 0
    };
    
    newTask.priorityScore = calculatePriorityScore(priority, effort, newTask.createdAt);
    setTasks(prev => [...prev, newTask]);
    
    toast({
      title: "✅ Task Added",
      description: `"${name}" has been added to your task list`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed };
        if (updatedTask.completed) {
          toast({
            title: "🎉 Task Completed",
            description: `Great job completing "${task.name}"!`,
          });
        }
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "🗑️ Task Deleted",
      description: `"${taskToDelete?.name}" has been removed from your list`,
    });
  };

  const clearAllTasks = () => {
    setTasks([]);
    toast({
      title: "🧹 All Tasks Cleared",
      description: "Your task list has been cleared",
    });
  };

  const rescheduleTask = (taskId: string, newStart: Date, newEnd: Date) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, scheduledStart: newStart, scheduledEnd: newEnd }
        : task
    ));
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
                tasks={tasks}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onClearAll={clearAllTasks}
              />
            </TabsContent>
            
            <TabsContent value="timeblocking" className="animate-fade-in">
              <TimeBlocking
                tasks={tasks}
                workdaySettings={workdaySettings}
                onRescheduleTask={rescheduleTask}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="animate-fade-in">
              <Settings
                settings={workdaySettings}
                onUpdateSettings={setWorkdaySettings}
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