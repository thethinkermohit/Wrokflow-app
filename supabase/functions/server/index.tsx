import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Root endpoint for basic connectivity test
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Workflow Tracker Server is running",
    timestamp: new Date().toISOString() 
  });
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Predefined users for internal access
const INTERNAL_USERS = {
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
  },
  // Add more users as needed
};

// Internal login endpoint
app.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    if (!username || !password) {
      return c.json({ error: "Username and password are required" }, 400);
    }

    const user = INTERNAL_USERS[username as keyof typeof INTERNAL_USERS];
    
    if (!user || user.password !== password) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    // Create a simple session token (in production, use proper JWT)
    const sessionToken = `session_${user.userId}_${Date.now()}`;
    
    // Store session in KV store with expiration
    await kv.set(`session_${sessionToken}`, {
      userId: user.userId,
      username: user.username,
      fullName: user.fullName,
      isAdmin: user.isAdmin || false,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

    return c.json({ 
      success: true,
      sessionToken,
      user: { 
        id: user.userId, 
        username: user.username,
        fullName: user.fullName,
        isAdmin: user.isAdmin || false
      } 
    });

  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: "Internal server error during login" }, 500);
  }
});

// Validate session helper
const validateSession = async (sessionToken: string) => {
  if (!sessionToken) {
    return null;
  }
  
  const session = await kv.get(`session_${sessionToken}`);
  if (!session) {
    return null;
  }
  
  // Check if session is expired
  if (new Date() > new Date(session.expiresAt)) {
    await kv.del(`session_${sessionToken}`);
    return null;
  }
  
  return session;
};

// Save user progress
app.post("/progress", async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateSession(sessionToken);
    
    if (!session) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    const body = await c.req.json();
    const { tasks } = body;

    if (!tasks) {
      return c.json({ error: "Tasks data is required" }, 400);
    }

    // Save tasks progress to KV store with user ID as key
    await kv.set(`user_progress_${session.userId}`, {
      tasks,
      lastUpdated: new Date().toISOString(),
      userId: session.userId,
      username: session.username
    });

    return c.json({ message: "Progress saved successfully" });

  } catch (error) {
    console.error('Error saving progress:', error);
    return c.json({ error: "Internal server error while saving progress" }, 500);
  }
});

// Get user progress
app.get("/progress", async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateSession(sessionToken);
    
    if (!session) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    // Get tasks progress from KV store
    const progress = await kv.get(`user_progress_${session.userId}`);

    if (!progress) {
      return c.json({ tasks: null, message: "No saved progress found" });
    }

    return c.json({ 
      tasks: progress.tasks, 
      lastUpdated: progress.lastUpdated 
    });

  } catch (error) {
    console.error('Error loading progress:', error);
    return c.json({ error: "Internal server error while loading progress" }, 500);
  }
});

// Reset user progress
app.delete("/progress", async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateSession(sessionToken);
    
    if (!session) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    // Delete progress from KV store
    await kv.del(`user_progress_${session.userId}`);

    return c.json({ message: "Progress reset successfully" });

  } catch (error) {
    console.error('Error resetting progress:', error);
    return c.json({ error: "Internal server error while resetting progress" }, 500);
  }
});

// Get user profile
app.get("/profile", async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateSession(sessionToken);
    
    if (!session) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    return c.json({ 
      user: {
        id: session.userId,
        username: session.username,
        fullName: session.fullName,
        loginTime: session.loginTime,
        isAdmin: session.isAdmin || false
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: "Internal server error while fetching profile" }, 500);
  }
});

// Logout endpoint
app.post("/logout", async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (sessionToken) {
      // Remove session from KV store
      await kv.del(`session_${sessionToken}`);
    }

    return c.json({ message: "Logged out successfully" });

  } catch (error) {
    console.error('Error during logout:', error);
    return c.json({ error: "Internal server error during logout" }, 500);
  }
});

// Admin-only: Get all users' progress
app.get("/admin/all-progress", async (c) => {
  try {
    console.log('Admin all-progress endpoint called');
    const sessionToken = c.req.header('Authorization')?.split(' ')[1];
    console.log('Session token:', sessionToken ? 'present' : 'missing');
    
    const session = await validateSession(sessionToken);
    console.log('Session validation result:', session ? 'valid' : 'invalid');
    
    if (!session) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    // Check if user is admin
    const userKey = Object.keys(INTERNAL_USERS).find(key => 
      INTERNAL_USERS[key as keyof typeof INTERNAL_USERS].userId === session.userId
    );
    const user = userKey ? INTERNAL_USERS[userKey as keyof typeof INTERNAL_USERS] : null;
    console.log('User found:', user ? user.username : 'none', 'isAdmin:', user?.isAdmin);
    
    if (!user?.isAdmin) {
      return c.json({ error: "Access denied. Admin privileges required." }, 403);
    }

    // Get all progress data by scanning keys with user_progress_ prefix
    console.log('Fetching progress data with prefix: user_progress_');
    const allProgressKeys = await kv.getByPrefix('user_progress_');
    console.log('Found progress entries:', allProgressKeys?.length || 0);
    
    const allUsersProgress = [];
    
    for (const progressData of allProgressKeys) {
      console.log('Processing progress data for user:', progressData?.userId);
      if (progressData && progressData.userId) {
        // Find user info
        const userInfo = Object.values(INTERNAL_USERS).find(u => u.userId === progressData.userId);
        console.log('Found user info:', userInfo ? userInfo.username : 'not found');
        
        if (userInfo) {
          try {
            // Calculate progress stats
            const tasks = progressData.tasks || [];
            let totalCheckboxes = 0;
            let completedCheckboxes = 0;
            let stagesCompleted = 0;
            
            tasks.forEach((task: any, taskIndex: number) => {
              try {
                ['stage1', 'stage2', 'stage3', 'stage4'].forEach(stageKey => {
                  const stageCheckboxes = task.stages && task.stages[stageKey] ? task.stages[stageKey] : [];
                  totalCheckboxes += stageCheckboxes.length;
                  completedCheckboxes += stageCheckboxes.filter((cb: any) => cb && cb.completed).length;
                });
              } catch (taskError) {
                console.error(`Error processing task ${taskIndex}:`, taskError);
              }
            });
            
            // Count completed stages - simplified logic
            if (tasks.length > 0) {
              ['stage1', 'stage2', 'stage3', 'stage4'].forEach(stageKey => {
                try {
                  const allStageTasksCompleted = tasks.every((task: any) => {
                    const stageCheckboxes = task.stages && task.stages[stageKey] ? task.stages[stageKey] : [];
                    return stageCheckboxes.length === 0 || stageCheckboxes.every((cb: any) => cb && cb.completed);
                  });
                  if (allStageTasksCompleted) {
                    stagesCompleted++;
                  }
                } catch (stageError) {
                  console.error(`Error processing stage ${stageKey}:`, stageError);
                }
              });
            }
            
            const userProgress = {
              userId: userInfo.userId,
              username: userInfo.username,
              fullName: userInfo.fullName,
              lastUpdated: progressData.lastUpdated || null,
              stats: {
                totalCheckboxes,
                completedCheckboxes,
                completionPercentage: totalCheckboxes > 0 ? Math.round((completedCheckboxes / totalCheckboxes) * 100) : 0,
                stagesCompleted
              },
              tasks: progressData.tasks || []
            };
            
            allUsersProgress.push(userProgress);
            console.log('Added user progress for:', userInfo.username);
          } catch (userProcessingError) {
            console.error('Error processing user data:', userProcessingError);
          }
        }
      }
    }

    console.log('Returning progress for', allUsersProgress.length, 'users');
    return c.json({ users: allUsersProgress });

  } catch (error) {
    console.error('Error fetching all progress:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: "Internal server error while fetching all progress" }, 500);
  }
});

// Admin-only: Get list of all users
app.get("/admin/users", async (c) => {
  try {
    const sessionToken = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateSession(sessionToken);
    
    if (!session) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    // Check if user is admin
    const userKey = Object.keys(INTERNAL_USERS).find(key => 
      INTERNAL_USERS[key as keyof typeof INTERNAL_USERS].userId === session.userId
    );
    const user = userKey ? INTERNAL_USERS[userKey as keyof typeof INTERNAL_USERS] : null;
    
    if (!user?.isAdmin) {
      return c.json({ error: "Access denied. Admin privileges required." }, 403);
    }

    const users = Object.values(INTERNAL_USERS)
      .filter(u => !u.isAdmin) // Don't include admin in the list
      .map(u => ({
        userId: u.userId,
        username: u.username,
        fullName: u.fullName
      }));

    return c.json({ users });

  } catch (error) {
    console.error('Error fetching users list:', error);
    return c.json({ error: "Internal server error while fetching users" }, 500);
  }
});

Deno.serve(app.fetch);