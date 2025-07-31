import { projectId, publicAnonKey } from './info';
import { localBackend } from './localBackend';

console.log('🔍 Client.ts - Loading dependencies...');

export class WorkflowTrackerAPI {
  private baseUrl: string;
  private sessionToken: string | null = null;
  private useLocalBackend: boolean = false;
  private backendTested: boolean = false;

  constructor() {
    console.log('🔍 WorkflowTrackerAPI - Constructor starting...');
    
    if (!projectId || !publicAnonKey) {
      console.error('❌ Missing required configuration:', { projectId: !!projectId, publicAnonKey: !!publicAnonKey });
      throw new Error('Missing required Supabase configuration');
    }
    
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a605d6a2`;
    console.log('✅ WorkflowTrackerAPI initialized successfully');
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
    try {
      if (token) {
        localStorage.setItem('workflow_tracker_session', token);
      } else {
        localStorage.removeItem('workflow_tracker_session');
      }
    } catch (error) {
      console.log('localStorage error:', error);
    }
  }

  getSessionToken(): string | null {
    if (!this.sessionToken) {
      try {
        this.sessionToken = localStorage.getItem('workflow_tracker_session');
      } catch (error) {
        console.log('localStorage error:', error);
        this.sessionToken = null;
      }
    }
    return this.sessionToken;
  }

  private async detectBackendMode(): Promise<void> {
    if (this.backendTested) return;

    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Server backend available');
        this.useLocalBackend = false;
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      console.log('⚠️ Using local backend');
      this.useLocalBackend = true;
    }
    
    this.backendTested = true;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    await this.detectBackendMode();

    if (this.useLocalBackend) {
      return this.routeToLocalBackend(endpoint, options);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getSessionToken();
    headers['Authorization'] = token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`;

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Non-JSON response: ${textResponse.substring(0, 200)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `Request failed with status ${response.status}`;
        if (response.status === 401) {
          throw new Error('Invalid or expired session');
        } else if (response.status === 403) {
          throw new Error('Access denied');
        } else if (response.status >= 500) {
          throw new Error('Server temporarily unavailable');
        }
        throw new Error(errorMessage);
      }

      return data;
    } catch (fetchError) {
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    }
  }

  private async routeToLocalBackend(endpoint: string, options: RequestInit) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : undefined;
    const token = this.getSessionToken();

    switch (endpoint) {
      case '/':
        return await localBackend.testConnectivity();
      case '/login':
        if (method === 'POST' && body) {
          return await localBackend.login(body.username, body.password);
        }
        break;
      case '/logout':
        if (method === 'POST') {
          return await localBackend.logout(token || '');
        }
        break;
      case '/progress':
        if (method === 'POST' && body) {
          return await localBackend.saveProgress(token || '', body.tasks);
        } else if (method === 'GET') {
          return await localBackend.getProgress(token || '');
        } else if (method === 'DELETE') {
          return await localBackend.resetProgress(token || '');
        }
        break;
      case '/profile':
        if (method === 'GET') {
          return await localBackend.getUserProfile(token || '');
        }
        break;
      case '/admin/all-progress':
        if (method === 'GET') {
          return await localBackend.getAllUsersProgress(token || '');
        }
        break;
      case '/admin/users':
        if (method === 'GET') {
          return await localBackend.getAllUsers(token || '');
        }
        break;
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
    
    throw new Error(`Invalid request: ${method} ${endpoint}`);
  }

  async login(username: string, password: string) {
    return this.makeRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.makeRequest('/logout', { method: 'POST' });
  }

  async saveProgress(tasks: any[]) {
    return this.makeRequest('/progress', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    });
  }

  async loadProgress() {
    return this.makeRequest('/progress', { method: 'GET' });
  }

  async resetProgress() {
    return this.makeRequest('/progress', { method: 'DELETE' });
  }

  async getProfile() {
    return this.makeRequest('/profile', { method: 'GET' });
  }

  async healthCheck() {
    return this.makeRequest('/health', { method: 'GET' });
  }

  async testConnectivity() {
    return this.makeRequest('/');
  }

  async getAllUsersProgress() {
    return this.makeRequest('/admin/all-progress');
  }

  async getAllUsers() {
    return this.makeRequest('/admin/users');
  }

  getBackendMode(): string {
    return this.useLocalBackend ? 'Local Storage' : 'Supabase Server';
  }

  refreshBackendDetection() {
    this.backendTested = false;
    this.useLocalBackend = false;
  }

  hasSessionToken(): boolean {
    const token = this.getSessionToken();
    return token !== null && token.length > 0;
  }

  clearSession() {
    this.setSessionToken(null);
  }
}

// Create and export singleton instance
console.log('🔍 Creating WorkflowTrackerAPI instance...');

let instance: WorkflowTrackerAPI;
try {
  instance = new WorkflowTrackerAPI();
  console.log('✅ WorkflowTrackerAPI instance created successfully');
} catch (error) {
  console.error('❌ Failed to create WorkflowTrackerAPI instance:', error);
  throw error;
}

export const apiClient = instance;
console.log('✅ API client exported successfully');