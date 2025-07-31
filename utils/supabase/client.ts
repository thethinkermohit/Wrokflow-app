import { projectId, publicAnonKey } from './info';
import { localBackend } from './localBackend';

// API client for server communication with automatic fallback to local backend
export class WorkflowTrackerAPI {
  private baseUrl: string;
  private sessionToken: string | null = null;
  private useLocalBackend: boolean = false;
  private backendTested: boolean = false;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a605d6a2`;
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
    // Store in localStorage for persistence
    try {
      if (token) {
        localStorage.setItem('workflow_tracker_session', token);
      } else {
        localStorage.removeItem('workflow_tracker_session');
      }
    } catch (storageError) {
      console.log('Could not access localStorage:', storageError);
    }
  }

  getSessionToken(): string | null {
    if (!this.sessionToken) {
      try {
        this.sessionToken = localStorage.getItem('workflow_tracker_session');
      } catch (storageError) {
        console.log('Could not access localStorage:', storageError);
        this.sessionToken = null;
      }
    }
    return this.sessionToken;
  }

  private async detectBackendMode(): Promise<void> {
    if (this.backendTested) return;

    try {
      console.log('Testing server connectivity...');
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Server backend is available');
        this.useLocalBackend = false;
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      console.log('⚠️ Server backend unavailable, switching to local backend');
      this.useLocalBackend = true;
    }
    
    this.backendTested = true;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    await this.detectBackendMode();

    if (this.useLocalBackend) {
      // Route to local backend methods
      return this.routeToLocalBackend(endpoint, options);
    }

    // Use server backend
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getSessionToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
    }

    let response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (fetchError) {
      console.log('Network error during request:', fetchError);
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    }

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.log('Non-JSON response received:', textResponse);
      throw new Error(`Server returned non-JSON response: ${textResponse.substring(0, 200)}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.log('JSON parse error:', parseError);
      throw new Error(`Failed to parse server response`);
    }

    if (!response.ok) {
      const errorMessage = data.error || `Request failed with status ${response.status}`;
      console.log(`Server error (${response.status}):`, errorMessage);
      
      // For auth-related errors, provide cleaner error messages
      if (response.status === 401) {
        throw new Error('Invalid or expired session');
      } else if (response.status === 403) {
        throw new Error('Access denied');
      } else if (response.status >= 500) {
        throw new Error('Server is temporarily unavailable');
      }
      
      throw new Error(errorMessage);
    }

    return data;
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
        throw new Error(`Unsupported local backend endpoint: ${endpoint}`);
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
    return this.makeRequest('/logout', {
      method: 'POST',
    });
  }

  async saveProgress(tasks: any[]) {
    return this.makeRequest('/progress', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    });
  }

  async loadProgress() {
    return this.makeRequest('/progress', {
      method: 'GET',
    });
  }

  async resetProgress() {
    return this.makeRequest('/progress', {
      method: 'DELETE',
    });
  }

  async getProfile() {
    return this.makeRequest('/profile', {
      method: 'GET',
    });
  }

  async healthCheck() {
    return this.makeRequest('/health', {
      method: 'GET',
    });
  }

  // Test basic connectivity
  async testConnectivity() {
    return this.makeRequest('/');
  }

  // Admin methods
  async getAllUsersProgress() {
    return this.makeRequest('/admin/all-progress');
  }

  async getAllUsers() {
    return this.makeRequest('/admin/users');
  }

  // Get current backend mode
  getBackendMode(): string {
    return this.useLocalBackend ? 'Local Storage' : 'Supabase Server';
  }

  // Force refresh backend detection
  refreshBackendDetection() {
    this.backendTested = false;
    this.useLocalBackend = false;
  }

  // Check if we have a session token
  hasSessionToken(): boolean {
    const token = this.getSessionToken();
    return token !== null && token.length > 0;
  }

  // Clear session and reset state
  clearSession() {
    console.log('Clearing session');
    this.setSessionToken(null);
  }
}

// Export singleton instance
export const apiClient = new WorkflowTrackerAPI();