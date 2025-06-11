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
  writeBatch
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
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      scheduledStart: doc.data().scheduledStart?.toDate(),
      scheduledEnd: doc.data().scheduledEnd?.toDate(),
    })) as Task[];
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
    const settingsDoc = await getDocs(collection(db, 'users', this.userId, 'settings'));
    
    if (settingsDoc.empty) {
      // Return default settings
      return {
        startTime: '09:00',
        endTime: '17:00',
        breakDuration: 30
      };
    }
    
    const data = settingsDoc.docs[0].data();
    return {
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '17:00',
      breakDuration: data.breakDuration || 30
    };
  }

  async updateSettings(settings: WorkdaySettings): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const settingsRef = doc(db, 'users', this.userId, 'settings', 'workday');
    await setDoc(settingsRef, settings, { merge: true });
  }

  // Migrate data from localStorage to Firebase
  async migrateFromLocalStorage(localTasks: Task[], localSettings: WorkdaySettings): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const batch = writeBatch(db);
    
    // Migrate tasks
    for (const task of localTasks) {
      const taskRef = doc(collection(db, 'users', this.userId, 'tasks'));
      const taskData = {
        ...task,
        createdAt: serverTimestamp(),
        scheduledStart: task.scheduledStart || null,
        scheduledEnd: task.scheduledEnd || null,
      };
      delete (taskData as any).id; // Remove the old ID
      batch.set(taskRef, taskData);
    }
    
    // Migrate settings
    const settingsRef = doc(db, 'users', this.userId, 'settings', 'workday');
    batch.set(settingsRef, localSettings, { merge: true });
    
    await batch.commit();
  }

  private calculatePriorityScore(priority: number, effort: number, createdAt: Date): number {
    if (!priority || !effort || !createdAt) return 0;
    if (typeof priority !== 'number' || typeof effort !== 'number') return 0;
    
    const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const urgencyMultiplier = 1 + (daysSinceCreated * 0.1);
    const efficiencyScore = priority / Math.max(effort, 1);
    return efficiencyScore * urgencyMultiplier;
  }
}

// Factory function to create storage adapter
export const createFirebaseStorage = (userId: string) => {
  return new FirebaseStorageAdapter(userId);
};