import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Alert, AlertDescription } from "./ui/alert";
import { RefreshCw, Users, TrendingUp, CheckSquare, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { apiClient } from "../utils/supabase/client";

interface UserProgress {
  userId: string;
  username: string;
  fullName: string;
  lastUpdated: string;
  stats: {
    totalCheckboxes: number;
    completedCheckboxes: number;
    completionPercentage: number;
    stagesCompleted: number;
  };
  tasks: any[];
}

export function AdminDashboard() {
  const [usersProgress, setUsersProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);

  const loadUsersProgress = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.getAllUsersProgress();
      setUsersProgress(response.users || []);
    } catch (error: any) {
      console.error('Error loading users progress:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(error.message || 'Failed to load users progress');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsersProgress();
  }, []);

  const overallStats = usersProgress.reduce(
    (acc, user) => ({
      totalUsers: acc.totalUsers + 1,
      avgCompletion: acc.avgCompletion + user.stats.completionPercentage,
      totalCheckboxes: acc.totalCheckboxes + user.stats.totalCheckboxes,
      completedCheckboxes: acc.completedCheckboxes + user.stats.completedCheckboxes,
    }),
    { totalUsers: 0, avgCompletion: 0, totalCheckboxes: 0, completedCheckboxes: 0 }
  );

  if (usersProgress.length > 0) {
    overallStats.avgCompletion = Math.round(overallStats.avgCompletion / overallStats.totalUsers);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStageStatus = (user: UserProgress, stage: number) => {
    const allStageTasksCompleted = user.tasks.every(task => {
      const stageCheckboxes = task.stages[stage]?.checkboxes || [];
      return stageCheckboxes.every((cb: any) => cb.completed);
    });
    return allStageTasksCompleted && user.tasks.length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor all users' progress in the Workflow Tracker</p>
            <div className="mt-2">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                Backend: {apiClient.getBackendMode()}
              </span>
            </div>
          </div>
          <Button onClick={loadUsersProgress} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.avgCompletion}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.completedCheckboxes}/{overallStats.totalCheckboxes}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats.totalCheckboxes > 0 
                  ? Math.round((overallStats.completedCheckboxes / overallStats.totalCheckboxes) * 100)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Users Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Users Progress Summary</CardTitle>
                <CardDescription>Overview of all users' completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Stages Completed</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersProgress.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Progress value={user.stats.completionPercentage} className="w-20" />
                            <div className="text-sm text-muted-foreground">
                              {user.stats.completedCheckboxes}/{user.stats.totalCheckboxes} tasks
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(stage => (
                              <Badge 
                                key={stage} 
                                variant={getStageStatus(user, stage) ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {stage}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.lastUpdated ? formatDate(user.lastUpdated) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.stats.completionPercentage === 100 ? "default" : 
                                   user.stats.completionPercentage > 50 ? "secondary" : "outline"}
                          >
                            {user.stats.completionPercentage === 100 ? 'Complete' :
                             user.stats.completionPercentage > 50 ? 'In Progress' : 'Getting Started'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {usersProgress.map((user) => (
                <Card key={user.userId}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{user.fullName}</span>
                      <Badge variant="outline">{user.stats.completionPercentage}%</Badge>
                    </CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>{user.stats.completedCheckboxes}/{user.stats.totalCheckboxes}</span>
                        </div>
                        <Progress value={user.stats.completionPercentage} />
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Stage Progress</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map(stage => {
                            const isCompleted = getStageStatus(user, stage);
                            return (
                              <div key={stage} className="text-center">
                                <Badge 
                                  variant={isCompleted ? "default" : "secondary"}
                                  className="w-full"
                                >
                                  Stage {stage}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {user.lastUpdated && (
                        <div className="text-xs text-muted-foreground">
                          Last updated: {formatDate(user.lastUpdated)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {usersProgress.length === 0 && !isLoading && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No user progress data found.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}