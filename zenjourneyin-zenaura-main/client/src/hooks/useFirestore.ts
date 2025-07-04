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
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

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
          notes: task.notes || undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          tags: Array.isArray(task.tags) ? task.tags : [],
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
        if (!db) {
          throw new Error('Database not initialized');
        }
        
        // Use subcollection for better data organization
        const userTasksRef = collection(db, 'users', userId, 'tasks');
        const q = query(
          userTasksRef, 
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
                  notes: data.notes || undefined,
                  dueDate: data.dueDate ? parseDate(data.dueDate) : null,
                  tags: Array.isArray(data.tags) ? data.tags : [],
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

  interface AddTaskData {
    name: string;
    priority: number;
    effort: number;
    notes?: string;
    dueDate?: Date | null;
    tags?: string[];
  }

  const addTask = async (data: AddTaskData) => {
    if (!userId) throw new Error('User not authenticated');
    if (!data.name?.trim()) throw new Error('Task name is required');
    if (data.priority < 1 || data.priority > 5) throw new Error('Priority must be between 1 and 5');
    if (data.effort < 0.5 || data.effort > 8) throw new Error('Effort must be between 0.5 and 8'); // Adjusted min effort
    
    const createdAt = new Date();
    const priorityScore = calculatePriorityScore(data.priority, data.effort, createdAt);
    
    const newTask: Task = {
      id: Date.now().toString(), // For demo mode, Firebase will generate its own ID
      name: data.name.trim(),
      priority: data.priority,
      effort: data.effort,
      completed: false,
      createdAt,
      priorityScore,
      notes: data.notes || undefined,
      dueDate: data.dueDate || null,
      tags: data.tags || [],
    };

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);
      return;
    }
    
    // Firebase mode - store in user subcollection
    const taskDataForFirebase: any = {
      name: data.name.trim(),
      priority: data.priority,
      effort: data.effort,
      completed: false,
      createdAt: serverTimestamp(),
      priorityScore,
      notes: data.notes || null, // Store null if undefined for consistency
      dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
      tags: data.tags || [],
    };
    
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      setSyncStatus('syncing');
      await addDoc(collection(db, 'users', userId, 'tasks'), taskData);
      setSyncStatus('synced');
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to save task: ${error.message}`);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!userId) throw new Error('User not authenticated');
    if (!id?.trim()) throw new Error('Task ID is required');

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      const taskExists = tasks.some(task => task.id === id);
      if (!taskExists) throw new Error('Task not found');
      
      const updatedTasks = tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      );
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);
      return;
    }

    // Firebase mode
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const taskRef = doc(db, 'users', userId, 'tasks', id);

      // Prepare updates, converting Date to Timestamp for Firebase
      const updatesForFirebase = { ...updates };
      if (updates.dueDate !== undefined) { // Handles null or a Date object
        updatesForFirebase.dueDate = updates.dueDate ? Timestamp.fromDate(updates.dueDate) : null;
      }
      // Ensure other Date fields if they were part of updates are also converted
      if (updates.scheduledStart && updates.scheduledStart instanceof Date) {
        updatesForFirebase.scheduledStart = Timestamp.fromDate(updates.scheduledStart);
      }
      if (updates.scheduledEnd && updates.scheduledEnd instanceof Date) {
        updatesForFirebase.scheduledEnd = Timestamp.fromDate(updates.scheduledEnd);
      }
      if (updates.createdAt && updates.createdAt instanceof Date) { // Should not typically be updated, but good practice
        updatesForFirebase.createdAt = Timestamp.fromDate(updates.createdAt);
      }

      const cleanUpdates = Object.fromEntries(
        Object.entries(updatesForFirebase).filter(([_, value]) => value !== undefined)
      );

      await updateDoc(taskRef, cleanUpdates);
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to update task: ${error.message}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!userId) throw new Error('User not authenticated');
    if (!id?.trim()) throw new Error('Task ID is required');

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      const taskExists = tasks.some(task => task.id === id);
      if (!taskExists) throw new Error('Task not found');
      
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      saveTasksToLocalStorage(updatedTasks);
      return;
    }

    // Firebase mode
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      await deleteDoc(doc(db, 'users', userId, 'tasks', id));
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to delete task: ${error.message}`);
    }
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
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const deletePromises = tasks.map(task => {
        if (!db) return Promise.resolve(null);
        return deleteDoc(doc(db, 'users', userId, 'tasks', task.id)).catch(err => {
          console.error(`Failed to delete task ${task.id}:`, err);
          return null; // Continue with other deletions
        });
      });
      
      await Promise.allSettled(deletePromises);
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to clear tasks: ${error.message}`);
    }
  };

  return {
    tasks,
    loading,
    error,
    syncStatus,
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
        if (!db) {
          throw new Error('Database not initialized');
        }
        
        const settingsRef = doc(db, 'users', userId, 'settings', 'workday');
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
    
    // Validate settings
    if (!newSettings.startTime || !newSettings.endTime) {
      throw new Error('Start time and end time are required');
    }
    if (typeof newSettings.breakDuration !== 'number' || newSettings.breakDuration < 0) {
      throw new Error('Break duration must be a positive number');
    }

    // Validate time format (HH:MM)
    const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormat.test(newSettings.startTime) || !timeFormat.test(newSettings.endTime)) {
      throw new Error('Invalid time format. Use HH:MM format');
    }

    setSettings(newSettings);

    // Demo mode - use localStorage
    if (userId.startsWith('demo-user-') || !db) {
      try {
        localStorage.setItem('zenjourney-demo-settings', JSON.stringify(newSettings));
      } catch (err) {
        console.error('Failed to save demo settings:', err);
        throw new Error('Failed to save settings locally');
      }
      return;
    }

    // Firebase mode
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      const settingsRef = doc(db, 'users', userId, 'settings', 'workday');
      await setDoc(settingsRef, newSettings, { merge: true });
    } catch (err) {
      const error = err as Error;
      throw new Error(`Failed to save settings: ${error.message}`);
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings
  };
};

const calculatePriorityScore = (priority: number, effort: number, createdAt: Date): number => {
  // Add validation to prevent NaN values
  if (!priority || !effort || !createdAt) return 0;
  if (typeof priority !== 'number' || typeof effort !== 'number') return 0;
  const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const urgencyMultiplier = 1 + (daysSinceCreated * 0.1);
  const efficiencyScore = priority / Math.max(effort, 1);
  return efficiencyScore * urgencyMultiplier;
};