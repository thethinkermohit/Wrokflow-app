export interface TaskCheckbox {
  id: string;
  completed: boolean;
  completedAt?: string; // ISO timestamp when completed
  uncompletedAt?: string; // ISO timestamp when uncompleted (for tracking reversals)
}

export interface Task {
  id: string;
  name: string;
  stages: {
    stage1: TaskCheckbox[];
    stage2: TaskCheckbox[];
    stage3: TaskCheckbox[];
    stage4: TaskCheckbox[];
  };
  metadata?: {
    createdAt?: string; // When task was first created
    firstCompletedAt?: string; // When first checkbox was completed
    lastActivityAt?: string; // Most recent activity
    stageCompletedDates?: {
      stage1?: string;
      stage2?: string;
      stage3?: string;
      stage4?: string;
    };
  };
}

// Analytics data structures
export interface DailyCompletionData {
  date: string; // YYYY-MM-DD format
  completed: number;
  taskBreakdown: {
    [taskId: string]: number;
  };
  stageBreakdown: {
    stage1: number;
    stage2: number;
    stage3: number;
    stage4: number;
  };
}

export interface WeeklyCompletionData {
  weekStart: string; // YYYY-MM-DD format (Monday)
  weekEnd: string;
  totalCompleted: number;
  dailyBreakdown: DailyCompletionData[];
  averagePerDay: number;
}

export interface MonthlyCompletionData {
  month: string; // YYYY-MM format
  totalCompleted: number;
  dailyBreakdown: DailyCompletionData[];
  weeklyBreakdown: WeeklyCompletionData[];
  averagePerDay: number;
  mostProductiveDay: string;
  leastProductiveDay: string;
}

export interface TaskAnalytics {
  totalTasks: number;
  totalCheckboxes: number;
  completedCheckboxes: number;
  completionRate: number;
  stageProgress: {
    stage1: { total: number; completed: number; percentage: number };
    stage2: { total: number; completed: number; percentage: number };
    stage3: { total: number; completed: number; percentage: number };
    stage4: { total: number; completed: number; percentage: number };
  };
  taskProgress: Array<{
    id: string;
    name: string;
    total: number;
    completed: number;
    percentage: number;
    lastActivity?: string;
  }>;
  dailyData: DailyCompletionData[];
  weeklyData: WeeklyCompletionData[];
  monthlyData: MonthlyCompletionData[];
  insights: {
    mostActiveHour?: number;
    mostProductiveDay?: string;
    averageSessionLength?: number;
    streakCount?: number;
    totalWorkingDays?: number;
  };
}

export const INITIAL_TASKS: Task[] = [
  {
    id: "task1",
    name: "New OPD",
    stages: {
      stage1: Array.from({ length: 13 }, (_, i) => ({ id: `t1s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 3 }, (_, i) => ({ id: `t1s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 3 }, (_, i) => ({ id: `t1s3c${i + 1}`, completed: false })),
      stage4: []
    }
  },
  {
    id: "task2",
    name: "Old OPD",
    stages: {
      stage1: Array.from({ length: 10 }, (_, i) => ({ id: `t2s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 4 }, (_, i) => ({ id: `t2s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 3 }, (_, i) => ({ id: `t2s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t2s4c${i + 1}`, completed: false }))
    }
  },
  {
    id: "task3",
    name: "Scaling",
    stages: {
      stage1: Array.from({ length: 6 }, (_, i) => ({ id: `t3s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 3 }, (_, i) => ({ id: `t3s2c${i + 1}`, completed: false })),
      stage3: [],
      stage4: []
    }
  },
  {
    id: "task4",
    name: "Composites",
    stages: {
      stage1: Array.from({ length: 6 }, (_, i) => ({ id: `t4s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 4 }, (_, i) => ({ id: `t4s2c${i + 1}`, completed: false })),
      stage3: [],
      stage4: []
    }
  },
  {
    id: "task5",
    name: "RCT",
    stages: {
      stage1: Array.from({ length: 6 }, (_, i) => ({ id: `t5s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 4 }, (_, i) => ({ id: `t5s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 1 }, (_, i) => ({ id: `t5s3c${i + 1}`, completed: false })),
      stage4: []
    }
  },
  {
    id: "task6",
    name: "Crown",
    stages: {
      stage1: Array.from({ length: 6 }, (_, i) => ({ id: `t6s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 3 }, (_, i) => ({ id: `t6s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 1 }, (_, i) => ({ id: `t6s3c${i + 1}`, completed: false })),
      stage4: []
    }
  },
  {
    id: "task7",
    name: "Surgical 8",
    stages: {
      stage1: Array.from({ length: 3 }, (_, i) => ({ id: `t7s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 2 }, (_, i) => ({ id: `t7s2c${i + 1}`, completed: false })),
      stage3: [],
      stage4: []
    }
  },
  {
    id: "task8",
    name: "Non-Surgical 8",
    stages: {
      stage1: Array.from({ length: 3 }, (_, i) => ({ id: `t8s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 1 }, (_, i) => ({ id: `t8s2c${i + 1}`, completed: false })),
      stage3: [],
      stage4: []
    }
  },
  {
    id: "task9",
    name: "Routine Extraction",
    stages: {
      stage1: Array.from({ length: 6 }, (_, i) => ({ id: `t9s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 2 }, (_, i) => ({ id: `t9s2c${i + 1}`, completed: false })),
      stage3: [],
      stage4: []
    }
  },
  {
    id: "task10",
    name: "Single Implant",
    stages: {
      stage1: Array.from({ length: 2 }, (_, i) => ({ id: `t10s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 2 }, (_, i) => ({ id: `t10s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 1 }, (_, i) => ({ id: `t10s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t10s4c${i + 1}`, completed: false }))
    }
  },
  {
    id: "task11",
    name: "Denture",
    stages: {
      stage1: Array.from({ length: 1 }, (_, i) => ({ id: `t11s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 1 }, (_, i) => ({ id: `t11s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 1 }, (_, i) => ({ id: `t11s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t11s4c${i + 1}`, completed: false }))
    }
  },
  {
    id: "task12",
    name: "RPD",
    stages: {
      stage1: Array.from({ length: 1 }, (_, i) => ({ id: `t12s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 2 }, (_, i) => ({ id: `t12s2c${i + 1}`, completed: false })),
      stage3: [],
      stage4: []
    }
  },
  {
    id: "task13",
    name: "Smile Designing",
    stages: {
      stage1: Array.from({ length: 1 }, (_, i) => ({ id: `t13s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 2 }, (_, i) => ({ id: `t13s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 2 }, (_, i) => ({ id: `t13s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t13s4c${i + 1}`, completed: false }))
    }
  },
  {
    id: "task14",
    name: "Orthodontics",
    stages: {
      stage1: Array.from({ length: 1 }, (_, i) => ({ id: `t14s1c${i + 1}`, completed: false })),
      stage2: Array.from({ length: 1 }, (_, i) => ({ id: `t14s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 2 }, (_, i) => ({ id: `t14s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t14s4c${i + 1}`, completed: false }))
    }
  },
  {
    id: "task15",
    name: "Invisalign",
    stages: {
      stage1: [],
      stage2: Array.from({ length: 1 }, (_, i) => ({ id: `t15s2c${i + 1}`, completed: false })),
      stage3: Array.from({ length: 2 }, (_, i) => ({ id: `t15s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t15s4c${i + 1}`, completed: false }))
    }
  },
  {
    id: "task16",
    name: "FMR",
    stages: {
      stage1: [],
      stage2: [],
      stage3: Array.from({ length: 1 }, (_, i) => ({ id: `t16s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t16s4c${i + 1}`, completed: false }))
    }
  },
  {
    id: "task17",
    name: "All-on-4 Implants",
    stages: {
      stage1: [],
      stage2: [],
      stage3: Array.from({ length: 1 }, (_, i) => ({ id: `t17s3c${i + 1}`, completed: false })),
      stage4: Array.from({ length: 1 }, (_, i) => ({ id: `t17s4c${i + 1}`, completed: false }))
    }
  }
];