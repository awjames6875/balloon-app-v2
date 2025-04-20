# REFRACTOR GUIDE

This document provides guidelines for refactoring the balloon design business platform as part of ongoing improvements and maintenance.

## Table of Contents

- [Storage Refactoring](#storage-refactoring)
- [Component Restructuring](#component-restructuring)
- [API Standardization](#api-standardization)
- [Database Schema Evolution](#database-schema-evolution)
- [Performance Optimization](#performance-optimization)

## Storage Refactoring

### Repository Pattern Implementation

The codebase is transitioning from a monolithic storage interface to a repository pattern for improved maintainability:

1. **Current Status**: `storage-updated.ts` implements the `DatabaseStorage` class which contains methods for all entity operations.
2. **Target Architecture**: Individual repositories for each domain entity (Users, Designs, Inventory, etc.)
3. **Implementation Steps**:
   - Create separate repository files for each entity
   - Implement consistent interfaces for CRUD operations
   - Update service code to use repositories instead of the monolithic storage

### Migration Timeline

- Phase 1: Build new repositories while maintaining backward compatibility
- Phase 2: Update service code to use new repositories
- Phase 3: Deprecate and remove the monolithic storage implementation

## Component Restructuring

### Frontend Component Organization

Refactor components according to these principles:

1. **Domain-Driven Organization**: Group components by business domain (Design, Inventory, Orders, etc.)
2. **Shared Component Library**: Extract common UI elements to a shared directory
3. **Container/Presentation Pattern**: Separate data fetching logic from presentation components

### Component Refactoring Priorities

1. Design Canvas components
2. Inventory management components
3. Order processing components
4. Authentication components

## API Standardization

Standardize API structure following these conventions:

1. **URI Structure**: Use resource-based routes (e.g., `/api/designs`, `/api/inventory`)
2. **Response Format**: Consistent envelope format for all API responses
3. **Error Handling**: Standardized error response format with meaningful codes and messages
4. **Validation**: Server-side validation with descriptive error messages

## Database Schema Evolution

Guidelines for evolving the database schema:

1. **Always Use Drizzle**: Make schema changes through Drizzle, not direct SQL
2. **Compatibility**: Consider data compatibility when modifying existing schemas
3. **Migration Process**: Use `npm run db:push` for schema changes
4. **Testing**: Thoroughly test schema changes in a development environment before production

## Performance Optimization

Areas for performance improvement:

1. **Query Optimization**: Review and optimize database queries
2. **Image Handling**: Implement optimized image storage and processing
3. **React Component Rendering**: Reduce unnecessary re-renders
4. **API Call Batching**: Consolidate multiple API calls where possible

---

This guide is a living document and will be updated as the refactoring process continues.


🧭 Step-by-Step Guide for Large Codebase Refactor
✅ Step 1: Safe Refactor Overview
Prompt to Use:
Safe & Smart Refactoring for Large Codebase

Goal:

Get a full analysis of code structure.

Identify risky areas and improvement zones.

No code edits — just suggestions.

📁 Step 2: File-by-File Refactor
Prompt to Use:
Refactor One File at a Time – No Functional Changes

What to Do:

Start with main file (e.g. main.py, app.js, etc.)

Refactor for readability and structure.

Avoid changing logic or output.

Move to next file after reviewing each result.

🔤 Step 3: Rename Variables for Clarity
Prompt to Use:
Rename Variables for Clarity Only

What to Do:

Only rename unclear variables/functions.

Get before/after list.

Confirm before applying changes project-wide.

🧠 Step 4: Organize Logic Without Changing Behavior
Prompt to Use:
Organize Code Without Changing Behavior

What to Do:

Group helper functions and logic into folders/modules.

Keep function and output behavior identical.

Add meaningful comments and structure for future devs.

🧪 Final Step: Test Everything
Run your app after each step.

Confirm outputs match previous versions.

Use version control (e.g., Replit Git, or export a ZIP before edits).

✅ Optional Bonus
Add version tags or comments like:

python
Copy
Edit
