
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, BarChart3 } from 'lucide-react';
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
    
    return {
      scheduledTasks,
      totalScheduledMinutes: scheduledTasks.reduce((sum, task) => sum + task.effort * 60, 0),
      totalWorkdayMinutes,
      unscheduledTasks: sortedTasks.filter(task => 
        !scheduledTasks.find(scheduled => scheduled.id === task.id)
      )
    };
  }, [tasks, workdaySettings]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'bg-red-500';
    if (priority >= 4) return 'bg-orange-500';
    if (priority >= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const utilizationPercentage = Math.round(
    (scheduleOptimization.totalScheduledMinutes / scheduleOptimization.totalWorkdayMinutes) * 100
  );

  return (
    <div className="space-y-6">
      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-gray-800">
              {scheduleOptimization.scheduledTasks.length}
            </p>
            <p className="text-sm text-gray-600">Scheduled Tasks</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-gray-800">
              {utilizationPercentage}%
            </p>
            <p className="text-sm text-gray-600">Day Utilization</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-gray-800">
              {Math.round(scheduleOptimization.totalScheduledMinutes / 60 * 10) / 10}h
            </p>
            <p className="text-sm text-gray-600">Total Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Blocking Visualization */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Time Blocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scheduleOptimization.scheduledTasks.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No tasks to schedule. Add some tasks to see your time blocks!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {scheduleOptimization.scheduledTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                >
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="text-sm font-medium text-gray-700">
                      {formatTime(task.scheduledStart)} - {formatTime(task.scheduledEnd)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      <span className="font-medium text-gray-800">{task.name}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {task.effort}h • Priority: {task.priority} • Score: {Math.round(task.priorityScore)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Block {index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unscheduled Tasks */}
      {scheduleOptimization.unscheduledTasks.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-orange-600">Unscheduled Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              These tasks couldn't fit in your current workday. Consider extending your work hours or moving them to another day.
            </p>
            <div className="space-y-2">
              {scheduleOptimization.unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                  <span className="flex-1 font-medium text-gray-800">{task.name}</span>
                  <span className="text-sm text-gray-600">{task.effort}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
