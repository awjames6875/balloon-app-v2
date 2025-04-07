import { User, InsertUser } from "@shared/schema";

export class UserMemoryStorage {
  private users: Map<number, User>;
  private userIdCounter: number;
  
  constructor() {
    this.users = new Map<number, User>();
    this.userIdCounter = 1;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.userIdCounter++,
      createdAt: new Date(),
      role: user.role || 'designer', // Default role
      ...user
    };
    
    this.users.set(newUser.id, newUser);
    return newUser;
  }
}