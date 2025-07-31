// Clean exports with comprehensive validation
console.log('🔍 Index.ts - Loading Supabase utilities...');

// Import and validate all dependencies
import { projectId, publicAnonKey } from './info';
import { localBackend, LocalBackend } from './localBackend';
import { apiClient, WorkflowTrackerAPI } from './client';

console.log('🔍 Index.ts - Import validation:', {
  projectId: !!projectId,
  publicAnonKey: !!publicAnonKey,
  localBackend: !!localBackend,
  apiClient: !!apiClient,
  WorkflowTrackerAPI: !!WorkflowTrackerAPI
});

// Comprehensive validation
if (!projectId) {
  console.error('❌ Missing projectId');
  throw new Error('Missing projectId configuration');
}

if (!publicAnonKey) {
  console.error('❌ Missing publicAnonKey');
  throw new Error('Missing publicAnonKey configuration');
}

if (!localBackend) {
  console.error('❌ Local backend failed to initialize');
  throw new Error('Local backend not available');
}

if (!apiClient) {
  console.error('❌ API Client failed to initialize');
  throw new Error('API Client not available');
}

if (!WorkflowTrackerAPI) {
  console.error('❌ WorkflowTrackerAPI class not available');
  throw new Error('WorkflowTrackerAPI class not available');
}

// Test API client methods
if (typeof apiClient.getSessionToken !== 'function') {
  console.error('❌ API Client missing required methods');
  throw new Error('API Client missing required methods');
}

// Clean, simple exports
export { projectId, publicAnonKey };
export { localBackend, LocalBackend };
export { apiClient, WorkflowTrackerAPI };

console.log('✅ Index.ts - All exports validated and ready');