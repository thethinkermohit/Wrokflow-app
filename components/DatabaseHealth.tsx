import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { RefreshCw, Database, AlertTriangle, CheckCircle, ExternalLink, Info } from "lucide-react";
import { Button } from "./ui/button";
import { apiClient } from "../utils/supabase/client";

interface DatabaseHealthData {
  timestamp: string;
  tableStats: {
    totalRecords: number;
    status: string;
    sampleSize: number;
  };
  dataDistribution: {
    sessions: number;
    userProgress: number;
    other: number;
  };
  indexIssue: {
    status: string;
    message: string;
    details: string;
    impact: string;
  };
  recommendations: string[];
  performance: {
    estimatedWriteSlowdown: string;
    estimatedStorageWaste: string;
    affectedOperations: string[];
  };
}

export function DatabaseHealth() {
  const [healthData, setHealthData] = useState<DatabaseHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const response = await fetch(`https://friuwcoerdzgzpccijsy.supabase.co/functions/v1/make-server-a605d6a2/admin/database-health`, {
        headers: {
          'Authorization': `Bearer ${apiClient.getSessionToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setHealthData(data);
        setLastUpdated(new Date());
      }
    } catch (error: any) {
      console.error('Error loading database health:', error);
      setError(error.message || 'Failed to load database health information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Database Health</h2>
          <p className="text-gray-600">Monitor database performance and identify issues</p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={loadHealthData} disabled={isLoading} className="flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : healthData ? (
        <div className="space-y-6">
          {/* Critical Issue Alert */}
          {healthData.indexIssue && healthData.indexIssue.status === 'warning' && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="space-y-2">
                  <div className="font-semibold">{healthData.indexIssue.message}</div>
                  <div className="text-sm">{healthData.indexIssue.details}</div>
                  <div className="text-sm font-medium">Impact: {healthData.indexIssue.impact}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(healthData.tableStats.status)}
                  {getStatusBadge(healthData.tableStats.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {healthData.tableStats.totalRecords} total records
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Impact</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {healthData.performance.estimatedWriteSlowdown}
                </div>
                <p className="text-xs text-muted-foreground">
                  Write slowdown estimate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storage Waste</CardTitle>
                <Database className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {healthData.performance.estimatedStorageWaste}
                </div>
                <p className="text-xs text-muted-foreground">
                  Redundant index storage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Data Distribution</CardTitle>
                <CardDescription>Current data patterns in the database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">User Sessions</span>
                    <Badge variant="outline">{healthData.dataDistribution.sessions}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">User Progress</span>
                    <Badge variant="outline">{healthData.dataDistribution.userProgress}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Other Data</span>
                    <Badge variant="outline">{healthData.dataDistribution.other}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affected Operations */}
            <Card>
              <CardHeader>
                <CardTitle>Affected Operations</CardTitle>
                <CardDescription>Database operations impacted by duplicate indexes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {healthData.performance.affectedOperations.map((operation, index) => (
                    <Badge key={index} variant="secondary" className="mr-2">
                      {operation}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  These operations are significantly slower due to duplicate indexes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Steps to resolve database performance issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm flex-1">{recommendation}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Quick Fix Guide</span>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  Follow the detailed cleanup instructions in the project documentation.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  Open Supabase Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Timestamp */}
          <div className="text-xs text-center text-muted-foreground">
            Health check performed: {formatDate(healthData.timestamp)}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No database health data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}