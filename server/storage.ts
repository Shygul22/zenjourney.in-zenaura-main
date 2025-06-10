import { users, tasks, workdaySettings, type User, type InsertUser, type Task, type InsertTask, type WorkdaySettings, type InsertWorkdaySettings } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getUserTasks(userId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  clearUserTasks(userId: number): Promise<boolean>;
  
  // Settings methods
  getUserSettings(userId: number): Promise<WorkdaySettings | undefined>;
  createOrUpdateSettings(settings: InsertWorkdaySettings): Promise<WorkdaySettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUserByFirebaseUid:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw error;
    }
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: number, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearUserTasks(userId: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.userId, userId));
    return (result.rowCount ?? 0) >= 0;
  }

  async getUserSettings(userId: number): Promise<WorkdaySettings | undefined> {
    const [settings] = await db.select().from(workdaySettings).where(eq(workdaySettings.userId, userId));
    return settings || undefined;
  }

  async createOrUpdateSettings(settingsData: InsertWorkdaySettings): Promise<WorkdaySettings> {
    const existing = await this.getUserSettings(settingsData.userId);
    
    if (existing) {
      const [updated] = await db
        .update(workdaySettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(workdaySettings.userId, settingsData.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(workdaySettings)
        .values(settingsData)
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
