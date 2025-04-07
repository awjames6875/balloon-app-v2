import { Design, InsertDesign } from "@shared/schema";

export class DesignMemoryStorage {
  private designs: Map<number, Design>;
  private designIdCounter: number;
  
  constructor() {
    this.designs = new Map<number, Design>();
    this.designIdCounter = 1;
  }
  
  async getDesign(id: number): Promise<Design | undefined> {
    return this.designs.get(id);
  }
  
  async getDesignsByUser(userId: number): Promise<Design[]> {
    return Array.from(this.designs.values()).filter(
      design => design.userId === userId
    );
  }
  
  async createDesign(design: InsertDesign): Promise<Design> {
    const newDesign: Design = {
      id: this.designIdCounter++,
      createdAt: new Date(),
      ...design,
      elements: design.elements || []
    };
    
    this.designs.set(newDesign.id, newDesign);
    return newDesign;
  }
  
  async updateDesign(id: number, design: Partial<Design>): Promise<Design | undefined> {
    const existingDesign = this.designs.get(id);
    
    if (!existingDesign) {
      return undefined;
    }
    
    const updatedDesign = {
      ...existingDesign,
      ...design
    };
    
    this.designs.set(id, updatedDesign);
    return updatedDesign;
  }
  
  async deleteDesign(id: number): Promise<boolean> {
    return this.designs.delete(id);
  }
}