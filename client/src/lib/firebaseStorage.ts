import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  getDocs,
  query, 
  orderBy, 
  where,
  serverTimestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, WorkdaySettings } from '../pages/Index';

export class FirebaseStorageAdapter {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Task operations using user subcollections
  async getAllTasks(): Promise<Task[]> {
    if (!db) throw new Error('Database not initialized');
    
    const tasksRef = collection(db, 'users', this.userId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        priority: data.priority || 1,
        effort: data.effort || 1,
        completed: data.completed || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        priorityScore: data.priorityScore || 0,
        scheduledStart: data.scheduledStart?.toDate(),
        scheduledEnd: data.scheduledEnd?.toDate(),
      } as Task;
    });
  }

  async addTask(name: string, priority: number, effort: number): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const tasksRef = collection(db, 'users', this.userId, 'tasks');
    const taskData = {
      name: name.trim(),
      priority,
      effort,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      priorityScore: this.calculatePriorityScore(priority, effort, new Date()),
    };
    
    const docRef = await addDoc(tasksRef, taskData);
    return docRef.id;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const taskRef = doc(db, 'users', this.userId, 'tasks', taskId);
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    // Add update timestamp
    cleanUpdates.updatedAt = serverTimestamp();
    
    await updateDoc(taskRef, cleanUpdates);
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const taskRef = doc(db, 'users', this.userId, 'tasks', taskId);
    await deleteDoc(taskRef);
  }

  async clearAllTasks(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const tasksRef = collection(db, 'users', this.userId, 'tasks');
    const snapshot = await getDocs(tasksRef);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  }

  // Settings operations using user subcollections
  async getSettings(): Promise<WorkdaySettings> {
    if (!db) throw new Error('Database not initialized');
    
    const settingsRef = doc(db, 'users', this.userId, 'settings', 'workday');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // Return default settings
      return {
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 30
      };
    }
    
    const data = settingsDoc.data();
    return {
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '17:00',
      breakDuration: data.breakDuration || 30
    };
  }

  async updateSettings(settings: WorkdaySettings): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const settingsRef = doc(db, 'users', this.userId, 'settings', 'workday');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // Migrate data from localStorage to Firebase
  async migrateFromLocalStorage(localTasks: Task[], localSettings: WorkdaySettings): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const batch = writeBatch(db);
    
    // Migrate tasks
    for (const task of localTasks) {
      const taskRef = doc(collection(db, 'users', this.userId, 'tasks'));
      const taskData = {
        name: task.name,
        priority: task.priority,
        effort: task.effort,
        completed: task.completed,
        priorityScore: task.priorityScore,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        scheduledStart: task.scheduledStart || null,
        scheduledEnd: task.scheduledEnd || null,
      };
      batch.set(taskRef, taskData);
    }
    
    // Migrate settings
    const settingsRef = doc(db, 'users', this.userId, 'settings', 'workday');
    batch.set(settingsRef, {
      ...localSettings,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    await batch.commit();
  }

  // Export all user data
  async exportAllData(): Promise<{
    tasks: Task[];
    settings: WorkdaySettings;
    exportDate: string;
  }> {
    const [tasks, settings] = await Promise.all([
      this.getAllTasks(),
      this.getSettings()
    ]);

    return {
      tasks,
      settings,
      exportDate: new Date().toISOString()
    };
  }

  // Backup user data to a backup collection
  async createBackup(): Promise<string> {
    if (!db) throw new Error('Database not initialized');
    
    const data = await this.exportAllData();
    const backupRef = collection(db, 'users', this.userId, 'backups');
    
    const docRef = await addDoc(backupRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  }

  private calculatePriorityScore(priority: number, effort: number, createdAt: Date): number {
    if (!priority || !effort || !createdAt) return 0;
    if (typeof priority !== 'number' || typeof effort !== 'number') return 0;
    
    const daysSinceCreated = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const urgencyMultiplier = 1 + (daysSinceCreated * 0.1);
    const efficiencyScore = priority / Math.max(effort, 0.1);
    
    return Math.round(efficiencyScore * urgencyMultiplier * 10) / 10;
  }
}

// Factory function to create storage adapter
export const createFirebaseStorage = (userId: string) => {
  return new FirebaseStorageAdapter(userId);
};

// Utility functions for data validation
export const validateTask = (task: Partial<Task>): string[] => {
  const errors: string[] = [];
  
  if (!task.name?.trim()) {
    errors.push('Task name is required');
  }
  
  if (task.priority !== undefined && (task.priority < 1 || task.priority > 5)) {
    errors.push('Priority must be between 1 and 5');
  }
  
  if (task.effort !== undefined && (task.effort < 0.5 || task.effort > 8)) {
    errors.push('Effort must be between 0.5 and 8 hours');
  }
  
  return errors;
};

export const validateSettings = (settings: Partial<WorkdaySettings>): string[] => {
  const errors: string[] = [];
  const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (settings.startTime && !timeFormat.test(settings.startTime)) {
    errors.push('Invalid start time format. Use HH:MM');
  }
  
  if (settings.endTime && !timeFormat.test(settings.endTime)) {
    errors.push('Invalid end time format. Use HH:MM');
  }
  
  if (settings.breakDuration !== undefined && (settings.breakDuration < 0 || settings.breakDuration > 120)) {
    errors.push('Break duration must be between 0 and 120 minutes');
  }
  
  return errors;
};