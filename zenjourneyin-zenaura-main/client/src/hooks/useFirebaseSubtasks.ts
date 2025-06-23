import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Subtask } from '../pages/Index'; // Assuming Subtask interface is exported from Index.tsx

export const useFirebaseSubtasks = (userId?: string, taskId?: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocalStorageKey = useCallback(() => `zenjourney-demo-task-${taskId}-subtasks`, [taskId]);

  const loadSubtasksFromLocalStorage = useCallback(() => {
    if (!taskId) return;
    try {
      const savedSubtasks = localStorage.getItem(getLocalStorageKey());
      if (savedSubtasks) {
        const parsedSubtasks = JSON.parse(savedSubtasks).map((st: any) => ({
          ...st,
          createdAt: new Date(st.createdAt),
        }));
        setSubtasks(parsedSubtasks);
      } else {
        setSubtasks([]);
      }
    } catch (err) {
      console.error('Error loading demo subtasks:', err);
      setSubtasks([]);
    } finally {
      setLoading(false);
    }
  }, [taskId, getLocalStorageKey]);

  const saveSubtasksToLocalStorage = useCallback((newSubtasks: Subtask[]) => {
    if (!taskId) return;
    try {
      localStorage.setItem(getLocalStorageKey(), JSON.stringify(newSubtasks));
    } catch (err) {
      console.error('Error saving demo subtasks:', err);
    }
  }, [taskId, getLocalStorageKey]);


  useEffect(() => {
    if (!userId || !taskId) {
      setSubtasks([]);
      setLoading(false);
      return;
    }

    if (userId.startsWith('demo-user-') || !db) {
      loadSubtasksFromLocalStorage();
      return;
    }

    if (!db) {
      setError("Firebase not initialized");
      setLoading(false);
      return;
    }

    const subtasksRef = collection(db, 'users', userId, 'tasks', taskId, 'subtasks');
    const q = query(subtasksRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const fetchedSubtasks = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            completed: data.completed || false,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          } as Subtask;
        });
        setSubtasks(fetchedSubtasks);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching subtasks for task ${taskId}:`, err);
        setError(`Failed to load subtasks: ${err.message}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, taskId]);

  const addSubtask = async (name: string) => {
    if (!userId || !taskId || !name.trim()) {
      throw new Error('User ID, Task ID, and Subtask name are required.');
    }

    if (userId.startsWith('demo-user-') || !db) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        name: name.trim(),
        completed: false,
        createdAt: new Date(),
      };
      const updatedSubtasks = [newSubtask, ...subtasks];
      setSubtasks(updatedSubtasks);
      saveSubtasksToLocalStorage(updatedSubtasks);
      return;
    }

    if (!db) throw new Error('Firebase not initialized');

    try {
      const subtasksRef = collection(db, 'users', userId, 'tasks', taskId, 'subtasks');
      await addDoc(subtasksRef, {
        name: name.trim(),
        completed: false,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding subtask:', err);
      throw new Error('Failed to add subtask.');
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    if (!userId || !taskId || !subtaskId) {
      throw new Error('User ID, Task ID, and Subtask ID are required.');
    }

    const subtask = subtasks.find(st => st.id === subtaskId);
    if (!subtask) throw new Error('Subtask not found.');

    if (userId.startsWith('demo-user-') || !db) {
      const updatedSubtasks = subtasks.map(st =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      setSubtasks(updatedSubtasks);
      saveSubtasksToLocalStorage(updatedSubtasks);
      return;
    }

    if (!db) throw new Error('Firebase not initialized');

    try {
      const subtaskRef = doc(db, 'users', userId, 'tasks', taskId, 'subtasks', subtaskId);
      await updateDoc(subtaskRef, { completed: !subtask.completed });
    } catch (err) {
      console.error('Error toggling subtask:', err);
      throw new Error('Failed to toggle subtask.');
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    if (!userId || !taskId || !subtaskId) {
      throw new Error('User ID, Task ID, and Subtask ID are required.');
    }

    if (userId.startsWith('demo-user-') || !db) {
      const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);
      setSubtasks(updatedSubtasks);
      saveSubtasksToLocalStorage(updatedSubtasks);
      return;
    }

    if (!db) throw new Error('Firebase not initialized');

    try {
      const subtaskRef = doc(db, 'users', userId, 'tasks', taskId, 'subtasks', subtaskId);
      await deleteDoc(subtaskRef);
    } catch (err) {
      console.error('Error deleting subtask:', err);
      throw new Error('Failed to delete subtask.');
    }
  };

  const updateSubtaskName = async (subtaskId: string, newName: string) => {
    if (!userId || !taskId || !subtaskId || !newName.trim()) {
      throw new Error('User ID, Task ID, Subtask ID, and new name are required.');
    }

    if (userId.startsWith('demo-user-') || !db) {
      const updatedSubtasks = subtasks.map(st =>
        st.id === subtaskId ? { ...st, name: newName.trim() } : st
      );
      setSubtasks(updatedSubtasks);
      saveSubtasksToLocalStorage(updatedSubtasks);
      return;
    }

    if (!db) throw new Error('Firebase not initialized');

    try {
      const subtaskRef = doc(db, 'users', userId, 'tasks', taskId, 'subtasks', subtaskId);
      await updateDoc(subtaskRef, { name: newName.trim() });
    } catch (err) {
      console.error('Error updating subtask name:', err);
      throw new Error('Failed to update subtask name.');
    }
  };


  return { subtasks, loading, error, addSubtask, toggleSubtask, deleteSubtask, updateSubtaskName };
};
