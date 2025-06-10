import { Task, WorkdaySettings } from '../pages/Index';

export interface StorageAdapter {
  tasks: {
    getAll: () => Promise<Task[]>;
    add: (name: string, priority: number, effort: number) => Promise<void>;
    update: (id: string, updates: Partial<Task>) => Promise<void>;
    delete: (id: string) => Promise<void>;
    clear: () => Promise<void>;
  };
  settings: {
    get: () => Promise<WorkdaySettings>;
    update: (settings: WorkdaySettings) => Promise<void>;
  };
}

class LocalStorageAdapter implements StorageAdapter {
  private taskKey = 'zenjourney-tasks';
  private settingsKey = 'zenjourney-settings';

  private calculatePriorityScore = (priority: number, effort: number, createdAt: Date): number => {
    const urgencyScore = priority * 20;
    const timeDecay = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    const effortPenalty = Math.max(0, (effort - 1) * 5);
    return Math.max(0, urgencyScore + timeDecay * 2 - effortPenalty);
  };

  tasks = {
    getAll: async (): Promise<Task[]> => {
      try {
        const saved = localStorage.getItem(this.taskKey);
        if (!saved) return [];
        
        return JSON.parse(saved).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          scheduledStart: task.scheduledStart ? new Date(task.scheduledStart) : undefined,
          scheduledEnd: task.scheduledEnd ? new Date(task.scheduledEnd) : undefined,
        }));
      } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
      }
    },

    add: async (name: string, priority: number, effort: number): Promise<void> => {
      const tasks = await this.tasks.getAll();
      const createdAt = new Date();
      const newTask: Task = {
        id: Date.now().toString(),
        name,
        priority,
        effort,
        completed: false,
        createdAt,
        priorityScore: this.calculatePriorityScore(priority, effort, createdAt)
      };
      
      tasks.push(newTask);
      localStorage.setItem(this.taskKey, JSON.stringify(tasks));
    },

    update: async (id: string, updates: Partial<Task>): Promise<void> => {
      const tasks = await this.tasks.getAll();
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        localStorage.setItem(this.taskKey, JSON.stringify(tasks));
      }
    },

    delete: async (id: string): Promise<void> => {
      const tasks = await this.tasks.getAll();
      const filtered = tasks.filter(t => t.id !== id);
      localStorage.setItem(this.taskKey, JSON.stringify(filtered));
    },

    clear: async (): Promise<void> => {
      localStorage.removeItem(this.taskKey);
    }
  };

  settings = {
    get: async (): Promise<WorkdaySettings> => {
      try {
        const saved = localStorage.getItem(this.settingsKey);
        return saved ? JSON.parse(saved) : {
          startTime: '09:00',
          endTime: '17:00',
          breakDuration: 15
        };
      } catch (error) {
        console.error('Error loading settings:', error);
        return {
          startTime: '09:00',
          endTime: '17:00',
          breakDuration: 15
        };
      }
    },

    update: async (settings: WorkdaySettings): Promise<void> => {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    }
  };
}

export const storage = new LocalStorageAdapter();