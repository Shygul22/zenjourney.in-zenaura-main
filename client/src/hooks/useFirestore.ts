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

  useEffect(() => {
    if (!userId || !db) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const tasksData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
              scheduledStart: data.scheduledStart instanceof Timestamp ? data.scheduledStart.toDate() : 
                             data.scheduledStart ? new Date(data.scheduledStart) : undefined,
              scheduledEnd: data.scheduledEnd instanceof Timestamp ? data.scheduledEnd.toDate() : 
                           data.scheduledEnd ? new Date(data.scheduledEnd) : undefined,
            } as Task;
          });
          setTasks(tasksData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching tasks:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up tasks listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [userId]);

  const addTask = async (name: string, priority: number, effort: number) => {
    if (!userId) throw new Error('User not authenticated');
    if (!db) throw new Error('Firebase not configured');
    
    const createdAt = new Date();
    const priorityScore = calculatePriorityScore(priority, effort, createdAt);
    
    const taskData = {
      name,
      priority,
      effort,
      completed: false,
      createdAt: serverTimestamp(),
      priorityScore,
      userId
    };

    try {
      await addDoc(collection(db, 'tasks'), taskData);
    } catch (err) {
      console.error('Error adding task:', err);
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const updateData = { ...updates };
      
      // Convert dates to timestamps for Firestore
      if (updateData.scheduledStart) {
        updateData.scheduledStart = Timestamp.fromDate(updateData.scheduledStart) as any;
      }
      if (updateData.scheduledEnd) {
        updateData.scheduledEnd = Timestamp.fromDate(updateData.scheduledEnd) as any;
      }
      
      await updateDoc(taskRef, updateData);
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { completed: !task.completed });
    }
  };

  const rescheduleTask = async (taskId: string, newStart: Date, newEnd: Date) => {
    await updateTask(taskId, { 
      scheduledStart: newStart, 
      scheduledEnd: newEnd 
    });
  };

  const clearAllTasks = async () => {
    try {
      const deletions = tasks.map(task => deleteTask(task.id));
      await Promise.all(deletions);
    } catch (err) {
      console.error('Error clearing tasks:', err);
      throw err;
    }
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
    breakDuration: 15
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !db) {
      setLoading(false);
      return;
    }

    try {
      const settingsRef = doc(db, 'settings', userId);
      const unsubscribe = onSnapshot(settingsRef,
        (doc) => {
          if (doc.exists()) {
            setSettings(doc.data() as WorkdaySettings);
          }
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching settings:', err);
          setError(err.message);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up settings listener:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [userId]);

  const updateSettings = async (newSettings: WorkdaySettings) => {
    if (!userId) throw new Error('User not authenticated');
    if (!db) throw new Error('Firebase not configured');
    
    try {
      const settingsRef = doc(db, 'settings', userId);
      await setDoc(settingsRef, { ...newSettings }, { merge: true });
      setSettings(newSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
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
  const urgencyScore = priority * 20; // 20-100 based on priority
  const timeDecay = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)); // Days since creation
  const effortPenalty = Math.max(0, (effort - 1) * 5); // Penalty for longer tasks
  
  return Math.max(0, urgencyScore + timeDecay * 2 - effortPenalty);
};