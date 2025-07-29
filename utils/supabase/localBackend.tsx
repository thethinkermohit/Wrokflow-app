// Local backend simulation for when Supabase server is unavailable
export class LocalBackend {
  private readonly STORAGE_PREFIX = 'workflow_tracker_';
  
  // Predefined users for internal access
  private readonly INTERNAL_USERS = {
    'admin': {
      username: 'admin',
      password: 'primum-non-nocere',
      fullName: 'Administrator',
      userId: 'admin_001',
      isAdmin: true
    },
    'dr.aditi': {
      username: 'dr.aditi',
      password: 'spidey&maguna',
      fullName: 'Dr. Aditi',
      userId: 'dr_aditi_001',
      isAdmin: false
    }
  };

  private getStorageKey(key: string): string {
    return `${this.STORAGE_PREFIX}${key}`;
  }

  private setItem(key: string, value: any): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(value));
    } catch (error) {
      console.log('Could not save to localStorage:', error);
    }
  }

  private getItem(key: string): any {
    try {
      const item = localStorage.getItem(this.getStorageKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.log('Could not read from localStorage:', error);
      return null;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(key));
    } catch (error) {
      console.log('Could not remove from localStorage:', error);
    }
  }

  async testConnectivity() {
    return Promise.resolve({
      status: "ok",
      message: "Local backend is running",
      timestamp: new Date().toISOString()
    });
  }

  async login(username: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay

    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const user = this.INTERNAL_USERS[username as keyof typeof this.INTERNAL_USERS];
    
    if (!user || user.password !== password) {
      throw new Error("Invalid username or password");
    }

    // Create a simple session token
    const sessionToken = `local_session_${user.userId}_${Date.now()}`;
    
    // Store session in localStorage with expiration
    this.setItem(`session_${sessionToken}`, {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

    return {
      success: true,
      sessionToken,
      user: { 
        id: user.userId, 
        username: user.username,
        fullName: user.fullName,
        isAdmin: user.isAdmin || false
      }
    };
  }

  async logout(sessionToken: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    if (sessionToken) {
      this.removeItem(`session_${sessionToken}`);
    }
    return { message: "Logged out successfully" };
  }

  private validateSession(sessionToken: string) {
    if (!sessionToken || sessionToken.trim() === '') {
      return null;
    }
    
    try {
      const session = this.getItem(`session_${sessionToken}`);
      if (!session) {
        return null;
      }
      
      // Check if session is expired
      if (new Date() > new Date(session.expiresAt)) {
        this.removeItem(`session_${sessionToken}`);
        return null;
      }
      
      return session;
    } catch (error) {
      console.log('Error validating session:', error);
      return null;
    }
  }

  async getUserProfile(sessionToken: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const session = this.validateSession(sessionToken);
    if (!session) {
      throw new Error("Invalid or expired session");
    }

    return {
      user: {
        id: session.userId,
        username: session.username,
        fullName: session.fullName,
        loginTime: session.loginTime,
        isAdmin: session.isAdmin || false
      }
    };
  }

  async saveProgress(sessionToken: string, tasks: any[]) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const session = this.validateSession(sessionToken);
    if (!session) {
      throw new Error("Invalid or expired session");
    }

    if (!tasks) {
      throw new Error("Tasks data is required");
    }

    // Save tasks progress to localStorage with user ID as key
    this.setItem(`user_progress_${session.userId}`, {
      tasks,
      lastUpdated: new Date().toISOString(),
      userId: session.userId,
      username: session.username
    });

    return { message: "Progress saved successfully" };
  }

  async getProgress(sessionToken: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const session = this.validateSession(sessionToken);
    if (!session) {
      throw new Error("Invalid or expired session");
    }

    // Get tasks progress from localStorage
    const progress = this.getItem(`user_progress_${session.userId}`);

    if (!progress) {
      return { tasks: null, message: "No saved progress found" };
    }

    return { 
      tasks: progress.tasks, 
      lastUpdated: progress.lastUpdated 
    };
  }

  async resetProgress(sessionToken: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const session = this.validateSession(sessionToken);
    if (!session) {
      throw new Error("Invalid or expired session");
    }

    // Delete progress from localStorage
    this.removeItem(`user_progress_${session.userId}`);

    return { message: "Progress reset successfully" };
  }

  async getAllUsersProgress(sessionToken: string) {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const session = this.validateSession(sessionToken);
    if (!session) {
      throw new Error("Invalid or expired session");
    }

    // Check if user is admin
    const userKey = Object.keys(this.INTERNAL_USERS).find(key => 
      this.INTERNAL_USERS[key as keyof typeof this.INTERNAL_USERS].userId === session.userId
    );
    const user = userKey ? this.INTERNAL_USERS[userKey as keyof typeof this.INTERNAL_USERS] : null;
    
    if (!user?.isAdmin) {
      throw new Error("Access denied. Admin privileges required.");
    }

    // Get all progress data from localStorage
    const allUsersProgress: any[] = [];
    
    // Check each user for progress data
    Object.values(this.INTERNAL_USERS).forEach(userInfo => {
      if (!userInfo.isAdmin) { // Don't include admin in the list
        const progressData = this.getItem(`user_progress_${userInfo.userId}`);
        
        if (progressData) {
          // Calculate progress stats
          const tasks = progressData.tasks || [];
          let totalCheckboxes = 0;
          let completedCheckboxes = 0;
          let stagesCompleted = 0;
          
          tasks.forEach((task: any) => {
            [1, 2, 3, 4].forEach(stage => {
              const stageData = task.stages && task.stages[stage];
              const stageCheckboxes = stageData?.checkboxes || [];
              totalCheckboxes += stageCheckboxes.length;
              completedCheckboxes += stageCheckboxes.filter((cb: any) => cb && cb.completed).length;
            });
          });
          
          // Count completed stages
          if (tasks.length > 0) {
            [1, 2, 3, 4].forEach(stage => {
              const allStageTasksCompleted = tasks.every((task: any) => {
                const stageData = task.stages && task.stages[stage];
                if (!stageData) return true;
                const stageCheckboxes = stageData.checkboxes || [];
                return stageCheckboxes.length === 0 || stageCheckboxes.every((cb: any) => cb && cb.completed);
              });
              if (allStageTasksCompleted) {
                stagesCompleted++;
              }
            });
          }
          
          allUsersProgress.push({
            userId: userInfo.userId,
            username: userInfo.username,
            fullName: userInfo.fullName,
            lastUpdated: progressData.lastUpdated,
            stats: {
              totalCheckboxes,
              completedCheckboxes,
              completionPercentage: totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0,
              stagesCompleted
            },
            tasks: progressData.tasks
          });
        } else {
          // Include users with no progress
          allUsersProgress.push({
            userId: userInfo.userId,
            username: userInfo.username,
            fullName: userInfo.fullName,
            lastUpdated: null,
            stats: {
              totalCheckboxes: 0,
              completedCheckboxes: 0,
              completionPercentage: 0,
              stagesCompleted: 0
            },
            tasks: []
          });
        }
      }
    });

    return { users: allUsersProgress };
  }

  async getAllUsers(sessionToken: string) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const session = this.validateSession(sessionToken);
    if (!session) {
      throw new Error("Invalid or expired session");
    }

    // Check if user is admin
    const userKey = Object.keys(this.INTERNAL_USERS).find(key => 
      this.INTERNAL_USERS[key as keyof typeof this.INTERNAL_USERS].userId === session.userId
    );
    const user = userKey ? this.INTERNAL_USERS[userKey as keyof typeof this.INTERNAL_USERS] : null;
    
    if (!user?.isAdmin) {
      throw new Error("Access denied. Admin privileges required.");
    }

    const users = Object.values(this.INTERNAL_USERS)
      .filter(u => !u.isAdmin) // Don't include admin in the list
      .map(u => ({
        userId: u.userId,
        username: u.username,
        fullName: u.fullName
      }));

    return { users };
  }
}

export const localBackend = new LocalBackend();