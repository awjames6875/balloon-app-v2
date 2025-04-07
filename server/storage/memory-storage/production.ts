import { Production, InsertProduction } from "@shared/schema";

export class ProductionMemoryStorage {
  private productions: Map<number, Production>;
  private productionIdCounter: number;
  
  constructor() {
    this.productions = new Map<number, Production>();
    this.productionIdCounter = 1;
  }
  
  async getProduction(id: number): Promise<Production | undefined> {
    return this.productions.get(id);
  }
  
  async getProductionsByDesign(designId: number): Promise<Production[]> {
    return Array.from(this.productions.values()).filter(
      production => production.designId === designId
    );
  }
  
  async createProduction(production: InsertProduction): Promise<Production> {
    const newProduction: Production = {
      id: this.productionIdCounter++,
      createdAt: new Date(),
      ...production
    };
    
    this.productions.set(newProduction.id, newProduction);
    return newProduction;
  }
  
  async updateProduction(id: number, production: Partial<Production>): Promise<Production | undefined> {
    const existingProduction = this.productions.get(id);
    
    if (!existingProduction) {
      return undefined;
    }
    
    const updatedProduction = {
      ...existingProduction,
      ...production
    };
    
    this.productions.set(id, updatedProduction);
    return updatedProduction;
  }
}