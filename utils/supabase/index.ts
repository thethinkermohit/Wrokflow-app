// Import everything first
import { projectId, publicAnonKey } from './info';
import { localBackend, LocalBackend } from './localBackend';
import { apiClient as client, WorkflowTrackerAPI } from './client';

// Re-export everything
export { projectId, publicAnonKey };
export { localBackend, LocalBackend };
export { WorkflowTrackerAPI };

// Export apiClient with explicit reference
export const apiClient = client;