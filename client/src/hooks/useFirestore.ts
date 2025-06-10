import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  onSnapshot, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, WorkdaySettings } from '../pages/Index';

export const useFirebaseTasks = (userId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage helper functions for demo mode
  const loadTasksFromLocalStorage = () => {
    try {
      const savedTasks = localStorage.getItem('zenjourney-demo-tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          scheduledStart: task.scheduledStart ? new Date(task.scheduledStart) : undefined,
          scheduledEnd: task.scheduledEnd ? new Date(task.scheduledEnd) : undefined,
        }));
        setTasks(parsedTasks);
      } else {
        setTasks([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading demo tasks:', err);
      setTasks([]);
      setLoading(false);
    }
  };

  const saveTasksToLocalStorage = (newTasks: Task[]) => {
    try {
      localStorage.setItem('zenjourney-demo-tasks', JSON.stringify(newTasks));
    } catch (err) {
      console.error('Error saving demo tasks:', err);
    }
  };

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    // Check if user is a demo user (starts with 'demo-user-')
    if (userId.startsWith('demo-user-') || !db) {
      // Use localStorage for demo mode
      loadTasksFromLocalStorage();
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupListener = async () => {
      try {
        const tasksRef = collection(db, 'tasks');
        const q = query(
          tasksRef, 
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            try {
              const tasksData = snapshot.docs.map(doc => {
                const data = doc.data();
                
                // Safe date parsing with fallbacks
                const parseDate = (dateValue: any): Date => {
                  if (dateValue instanceof Timestamp) {
                    return dateValue.toDate();
                  }
                  if (dateValue && typeof dateValue === 'string') {
                    const parsed = new Date(dateValue);
                    return isNaN(parsed.getTime()) ? new Date() : parsed;
                  }
                  if (dateValue && typeof dateValue === 'number') {
                    return new Date(dateValue);
                  }
                  return new Date();
                };

                return {
                  id: doc.id,
                  name: data.name || '',
                  priority: data.priority || 1,
                  effort: data.effort || 1,
                  completed: data.completed || false,
                  createdAt: parseDate(data.createdAt),
                  priorityScore: data.priorityScore || 0,
                  scheduledStart: data.scheduledStart ? parseDate(data.scheduledStart) : undefined,
                  scheduledEnd: data.scheduledEnd ? parseDate(data.scheduledEnd) : undefined,
                } as Task;
              });
              
              setTasks(tasksData);
              setLoading(false);
              setError(null);
            } catch (parseError) {
              console.error('Error parsing task data:', parseError);
              setError('Failed to parse task data');
              setLoading(false);
            }
          },
          (err) => {
            console.error('Error fetching tasks:', err);
            setError(`Failed to load tasks: ${err.message}`);
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('Error setting up tasks listener:', err);
        setError(`Failed to setup data connection: ${err.message}`);
        setLoading(false);
      }
    };

    setupListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const addTask = async (name: string, priority: number, effort: number) => {
    if (!userId) throw new Error('User not authenticated');
    
    const createdAt = new Date();
    const priorityScore = calculatePriorityScore(priority, effort, createdAt);
    
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      priority,
      effort,
      completed: false,
      createdAt,
      priorityScore,
    };

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);
      return;
    }
    
    // Firebase mode
    const taskData = {
      name,
      priority,
      effort,
      completed: false,
      userId,
      createdAt: serverTimestamp(),
      priorityScore,
    };
    
    await addDoc(collection(db, 'tasks'), taskData);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!userId) throw new Error('User not authenticated');

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      );
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);
      return;
    }

    // Firebase mode
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, updates);
  };

  const deleteTask = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);
      return;
    }

    // Firebase mode
    await deleteDoc(doc(db, 'tasks', id));
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const rescheduleTask = async (taskId: string, newStart: Date, newEnd: Date) => {
    await updateTask(taskId, { 
      scheduledStart: newStart, 
      scheduledEnd: newEnd 
    });
  };

  const clearAllTasks = async () => {
    if (!userId) throw new Error('User not authenticated');

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      setTasks([]);
      saveTasksToLocalStorage([]);
      return;
    }

    // Firebase mode - delete all user tasks
    const tasksToDelete = tasks.map(task => deleteDoc(doc(db, 'tasks', task.id)));
    await Promise.all(tasksToDelete);
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    rescheduleTask,
    clearAllTasks
  };
};

export const useFirebaseSettings = (userId?: string) => {
  const [settings, setSettings] = useState<WorkdaySettings>({
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 30
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      try {
        const savedSettings = localStorage.getItem('zenjourney-demo-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Validate settings structure
          if (parsed.startTime && parsed.endTime && typeof parsed.breakDuration === 'number') {
            setSettings(parsed);
          }
        }
      } catch (err) {
        console.error('Error loading demo settings:', err);
        // Keep default settings
      }
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    // Firebase mode
    const setupListener = async () => {
      try {
        const settingsRef = doc(db, 'settings', userId);
        unsubscribe = onSnapshot(settingsRef, 
          (doc) => {
            try {
              if (doc.exists()) {
                const data = doc.data();
                // Validate settings data
                const validatedSettings: WorkdaySettings = {
                  startTime: data.startTime || '09:00',
                  endTime: data.endTime || '17:00',
                  breakDuration: typeof data.breakDuration === 'number' ? data.breakDuration : 30
                };
                setSettings(validatedSettings);
              }
              setLoading(false);
              setError(null);
            } catch (parseError) {
              console.error('Error parsing settings data:', parseError);
              setError('Failed to parse settings data');
              setLoading(false);
            }
          },
          (err) => {
            console.error('Error fetching settings:', err);
            setError(`Failed to load settings: ${err.message}`);
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('Error setting up settings listener:', err);
        setError(`Failed to setup settings connection: ${err.message}`);
        setLoading(false);
      }
    };

    setupListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId]);

  const updateSettings = async (newSettings: WorkdaySettings) => {
    if (!userId) throw new Error('User not authenticated');

    setSettings(newSettings);

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      localStorage.setItem('zenjourney-demo-settings', JSON.stringify(newSettings));
      return;
    }

    // Firebase mode
    const settingsRef = doc(db, 'settings', userId);
    await setDoc(settingsRef, newSettings, { merge: true });
  };

  return {
    settings,
    loading,
    error,
    updateSettings
  };
};

const calculatePriorityScore = (priority: number, effort: number, createdAt: Date): number => {
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const urgencyMultiplier = 1 + (daysSinceCreated * 0.1);
  const efficiencyScore = priority / Math.max(effort, 1);
  return efficiencyScore * urgencyMultiplier;
};