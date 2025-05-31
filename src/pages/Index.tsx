
import React, { useState, useEffect } from 'react';
import { TaskList } from '../components/TaskList';
import { TimeBlocking } from '../components/TimeBlocking';
import { Settings } from '../components/Settings';
import { Header } from '../components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('zenjourney-tasks');
    const savedSettings = localStorage.getItem('zenjourney-settings');
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          scheduledStart: task.scheduledStart ? new Date(task.scheduledStart) : undefined,
          scheduledEnd: task.scheduledEnd ? new Date(task.scheduledEnd) : undefined,
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load saved tasks",
          variant: "destructive"
        });
      }
    }
    
    if (savedSettings) {
      try {
        setWorkdaySettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, [toast]);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('zenjourney-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('zenjourney-settings', JSON.stringify(workdaySettings));
  }, [workdaySettings]);

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
      title: "Task Added",
      description: `"${name}" has been added to your task list`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Task has been removed from your list",
    });
  };

  const clearAllTasks = () => {
    setTasks([]);
    toast({
      title: "All Tasks Cleared",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Header />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/80 backdrop-blur-sm shadow-lg">
              <TabsTrigger 
                value="tasks" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
              >
                Task List
              </TabsTrigger>
              <TabsTrigger 
                value="timeblocking" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
              >
                Time Blocking
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-300"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            
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
    </div>
  );
};

export default Index;
