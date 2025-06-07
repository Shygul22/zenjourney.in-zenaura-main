import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, BarChart3, AlertTriangle, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';
import { Task, WorkdaySettings } from '../pages/Index';

interface TimeBlockingProps {
  tasks: Task[];
  workdaySettings: WorkdaySettings;
  onRescheduleTask: (taskId: string, newStart: Date, newEnd: Date) => void;
}

export const TimeBlocking: React.FC<TimeBlockingProps> = ({
  tasks,
  workdaySettings,
  onRescheduleTask
}) => {
  const scheduleOptimization = useMemo(() => {
    const pendingTasks = tasks.filter(task => !task.completed);
    const sortedTasks = [...pendingTasks].sort((a, b) => b.priorityScore - a.priorityScore);
    
    const [startHour, startMinute] = workdaySettings.startTime.split(':').map(Number);
    const [endHour, endMinute] = workdaySettings.endTime.split(':').map(Number);
    
    const workdayStart = new Date();
    workdayStart.setHours(startHour, startMinute, 0, 0);
    
    const workdayEnd = new Date();
    workdayEnd.setHours(endHour, endMinute, 0, 0);
    
    const totalWorkdayMinutes = (workdayEnd.getTime() - workdayStart.getTime()) / (1000 * 60);
    
    let currentTime = new Date(workdayStart);
    const scheduledTasks: (Task & { scheduledStart: Date; scheduledEnd: Date })[] = [];
    
    for (const task of sortedTasks) {
      const taskDurationMinutes = task.effort * 60;
      const taskEnd = new Date(currentTime.getTime() + taskDurationMinutes * 60 * 1000);
      
      if (taskEnd <= workdayEnd) {
        scheduledTasks.push({
          ...task,
          scheduledStart: new Date(currentTime),
          scheduledEnd: new Date(taskEnd)
        });
        
        // Move to next slot with break
        currentTime = new Date(taskEnd.getTime() + workdaySettings.breakDuration * 60 * 1000);
      }
    }
    
    const totalScheduledMinutes = scheduledTasks.reduce((sum, task) => sum + task.effort * 60, 0);
    const totalBreakMinutes = Math.max(0, (scheduledTasks.length - 1) * workdaySettings.breakDuration);
    const totalUsedMinutes = totalScheduledMinutes + totalBreakMinutes;
    
    return {
      scheduledTasks,
      totalScheduledMinutes,
      totalBreakMinutes,
      totalUsedMinutes,
      totalWorkdayMinutes,
      unscheduledTasks: sortedTasks.filter(task => 
        !scheduledTasks.find(scheduled => scheduled.id === task.id)
      ),
      efficiency: totalWorkdayMinutes > 0 ? (totalScheduledMinutes / totalWorkdayMinutes) * 100 : 0
    };
  }, [tasks, workdaySettings]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityConfig = (priority: number) => {
    if (priority >= 5) return {
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      icon: '🔴'
    };
    if (priority >= 4) return {
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
      icon: '🟠'
    };
    if (priority >= 3) return {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border-yellow-200',
      icon: '🟡'
    };
    return {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50 border-green-200',
      icon: '🟢'
    };
  };

  const utilizationPercentage = Math.round(scheduleOptimization.efficiency);
  const productivityScore = Math.round(
    (scheduleOptimization.scheduledTasks.reduce((sum, task) => sum + task.priorityScore, 0) / 
     Math.max(1, scheduleOptimization.scheduledTasks.length)) * 
    (utilizationPercentage / 100)
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-elevated">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">
              {scheduleOptimization.scheduledTasks.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Scheduled Tasks</div>
            <div className="text-xs text-gray-500 mt-1">
              {scheduleOptimization.unscheduledTasks.length} remaining
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">
              {utilizationPercentage}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Day Utilization</div>
            <Progress value={utilizationPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card className="card-elevated">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">
              {Math.round(scheduleOptimization.totalScheduledMinutes / 60 * 10) / 10}h
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Scheduled</div>
            <div className="text-xs text-gray-500 mt-1">
              +{Math.round(scheduleOptimization.totalBreakMinutes)}m breaks
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-800">
              {productivityScore}
            </div>
            <div className="text-sm text-gray-600 mt-1">Productivity Score</div>
            <div className="text-xs text-gray-500 mt-1">
              Based on priority & efficiency
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Insights */}
      {scheduleOptimization.scheduledTasks.length > 0 && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Schedule Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-blue-900">Peak Hours</div>
                  <div className="text-xs text-blue-700">
                    {formatTime(scheduleOptimization.scheduledTasks[0]?.scheduledStart)} - {formatTime(scheduleOptimization.scheduledTasks[Math.floor(scheduleOptimization.scheduledTasks.length / 2)]?.scheduledEnd || scheduleOptimization.scheduledTasks[0]?.scheduledEnd)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-green-900">Completion Rate</div>
                  <div className="text-xs text-green-700">
                    {Math.round((scheduleOptimization.scheduledTasks.length / Math.max(1, tasks.filter(t => !t.completed).length)) * 100)}% schedulable
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-purple-900">Focus Time</div>
                  <div className="text-xs text-purple-700">
                    {Math.round(scheduleOptimization.totalScheduledMinutes / 60 * 10) / 10}h of deep work
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Blocking Visualization */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Daily Time Blocks
          </CardTitle>
          {scheduleOptimization.scheduledTasks.length > 0 && (
            <div className="text-sm text-gray-600">
              Optimized schedule based on priority scores and available time
            </div>
          )}
        </CardHeader>
        <CardContent>
          {scheduleOptimization.scheduledTasks.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No tasks to schedule</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Add some tasks to see your optimized time blocks. The AI will automatically arrange them based on priority and effort.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduleOptimization.scheduledTasks.map((task, index) => {
                const priorityConfig = getPriorityConfig(task.priority);
                const isBreakAfter = index < scheduleOptimization.scheduledTasks.length - 1;
                
                return (
                  <div key={task.id} className="space-y-2">
                    <div
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${priorityConfig.bgColor}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex flex-col items-center text-center min-w-[80px] sm:min-w-[100px]">
                          <div className="text-sm font-medium text-gray-700">
                            {formatTime(task.scheduledStart)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(task.scheduledEnd)}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {task.effort}h
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${priorityConfig.color}`}></div>
                            <h4 className="font-medium text-gray-800 truncate">{task.name}</h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <span className="mr-1">{priorityConfig.icon}</span>
                              Priority {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Score: {Math.round(task.priorityScore)}
                            </Badge>
                            <div className="text-xs text-gray-500">
                              Block {index + 1} of {scheduleOptimization.scheduledTasks.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isBreakAfter && (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{workdaySettings.breakDuration}min break</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unscheduled Tasks */}
      {scheduleOptimization.unscheduledTasks.length > 0 && (
        <Card className="card-elevated border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              Unscheduled Tasks ({scheduleOptimization.unscheduledTasks.length})
            </CardTitle>
            <div className="text-sm text-orange-600">
              These tasks couldn't fit in your current workday. Consider extending your work hours, breaking them into smaller chunks, or moving them to another day.
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduleOptimization.unscheduledTasks.map((task) => {
                const priorityConfig = getPriorityConfig(task.priority);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-orange-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className={`w-3 h-3 rounded-full ${priorityConfig.color}`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{task.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${priorityConfig.textColor} bg-white`}>
                          <span className="mr-1">{priorityConfig.icon}</span>
                          Priority {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{task.effort}h required</span>
                        <span className="text-xs text-gray-500">Score: {Math.round(task.priorityScore)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-4 bg-orange-100 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">💡 Suggestions:</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Extend your workday by {Math.ceil(scheduleOptimization.unscheduledTasks.reduce((sum, task) => sum + task.effort, 0))} hours</li>
                <li>• Break large tasks into smaller, manageable chunks</li>
                <li>• Consider moving lower-priority tasks to tomorrow</li>
                <li>• Reduce break duration to fit more tasks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Summary */}
      {scheduleOptimization.scheduledTasks.length > 0 && (
        <Card className="card-elevated bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">📊 Schedule Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(scheduleOptimization.totalUsedMinutes / 60 * 10) / 10}h
                  </div>
                  <div className="text-xs text-blue-700">Total Time Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((scheduleOptimization.totalWorkdayMinutes - scheduleOptimization.totalUsedMinutes) / 60 * 10) / 10}h
                  </div>
                  <div className="text-xs text-green-700">Free Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {scheduleOptimization.totalBreakMinutes}m
                  </div>
                  <div className="text-xs text-purple-700">Break Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {productivityScore}
                  </div>
                  <div className="text-xs text-indigo-700">Productivity Score</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};