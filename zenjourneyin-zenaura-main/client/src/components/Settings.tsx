import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Clock, Coffee, Sun, Moon, Zap, Target, Brain, Timer } from 'lucide-react';
import { WorkdaySettings } from '../pages/Index';

interface SettingsProps {
  settings: WorkdaySettings;
  onUpdateSettings: (settings: WorkdaySettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings
}) => {
  const handleStartTimeChange = (value: string) => {
    onUpdateSettings({ ...settings, startTime: value });
  };

  const handleEndTimeChange = (value: string) => {
    onUpdateSettings({ ...settings, endTime: value });
  };

  const handleBreakDurationChange = (value: number[]) => {
    onUpdateSettings({ ...settings, breakDuration: value[0] });
  };

  const calculateWorkdayDuration = () => {
    const [startHour, startMinute] = settings.startTime.split(':').map(Number);
    const [endHour, endMinute] = settings.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    const totalMinutes = endMinutes - startMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return { hours, minutes, totalMinutes };
  };

  const workdayDuration = calculateWorkdayDuration();
  
  const getWorkdayType = () => {
    if (workdayDuration.totalMinutes < 360) return { type: 'Short', color: 'bg-green-100 text-green-800', icon: '⚡' };
    if (workdayDuration.totalMinutes < 480) return { type: 'Standard', color: 'bg-blue-100 text-blue-800', icon: '⏰' };
    if (workdayDuration.totalMinutes < 600) return { type: 'Extended', color: 'bg-orange-100 text-orange-800', icon: '🔥' };
    return { type: 'Marathon', color: 'bg-red-100 text-red-800', icon: '💪' };
  };

  const getBreakRecommendation = () => {
    if (settings.breakDuration < 10) return { text: 'Quick breaks', color: 'text-orange-600' };
    if (settings.breakDuration < 20) return { text: 'Balanced breaks', color: 'text-green-600' };
    if (settings.breakDuration < 30) return { text: 'Extended breaks', color: 'text-blue-600' };
    return { text: 'Long breaks', color: 'text-purple-600' };
  };

  const workdayType = getWorkdayType();
  const breakRecommendation = getBreakRecommendation();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <Card className="card-elevated bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Workday Configuration</h2>
          <p className="text-blue-700 max-w-2xl mx-auto">
            Customize your daily schedule to optimize productivity and maintain work-life balance. 
            These settings help the AI create the perfect time blocks for your tasks.
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-elevated text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {workdayDuration.hours}h {workdayDuration.minutes}m
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Duration</div>
            <Badge className={`mt-2 text-xs ${workdayType.color}`}>
              <span className="mr-1">{workdayType.icon}</span>
              {workdayType.type} Day
            </Badge>
          </CardContent>
        </Card>

        <Card className="card-elevated text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl">
              <Sun className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {settings.startTime}
            </div>
            <div className="text-sm text-gray-600 mt-1">Start Time</div>
            <div className="text-xs text-gray-500 mt-2">
              {parseInt(settings.startTime.split(':')[0]) < 8 ? 'Early Bird 🌅' : 
               parseInt(settings.startTime.split(':')[0]) < 10 ? 'Standard Start ⏰' : 'Late Start 🌙'}
            </div>
          </CardContent>
        </Card>

        <Card className="card-elevated text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-purple-100 rounded-xl">
              <Moon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {settings.endTime}
            </div>
            <div className="text-sm text-gray-600 mt-1">End Time</div>
            <div className="text-xs text-gray-500 mt-2">
              {parseInt(settings.endTime.split(':')[0]) < 17 ? 'Early Finish 🏃' : 
               parseInt(settings.endTime.split(':')[0]) < 19 ? 'Standard End 🏠' : 'Late Finish 🌙'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Configuration */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            Schedule Settings
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure your daily work schedule for optimal task planning
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="startTime" className="flex items-center gap-2 text-sm font-medium">
                <Sun className="w-4 h-4 text-green-600" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={settings.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="text-lg font-mono transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                aria-describedby="startTime-help"
              />
              <p id="startTime-help" className="text-xs text-gray-500">
                When do you typically start your workday?
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="endTime" className="flex items-center gap-2 text-sm font-medium">
                <Moon className="w-4 h-4 text-purple-600" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={settings.endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="text-lg font-mono transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                aria-describedby="endTime-help"
              />
              <p id="endTime-help" className="text-xs text-gray-500">
                When do you typically end your workday?
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Coffee className="w-4 h-4 text-orange-600" />
              Break Duration: <span className="font-bold text-orange-600">{settings.breakDuration} minutes</span>
            </Label>
            <Slider
              value={[settings.breakDuration]}
              onValueChange={handleBreakDurationChange}
              max={60}
              min={5}
              step={5}
              className="w-full"
              aria-label="Break duration between tasks"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min (Quick)</span>
              <span>30 min (Balanced)</span>
              <span>60 min (Extended)</span>
            </div>
            <div className="flex items-center justify-center">
              <Badge variant="outline" className={`text-sm ${breakRecommendation.color}`}>
                {breakRecommendation.text}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Productivity Insights */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Productivity Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Schedule Analysis
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700">Available Work Time:</span>
                  <span className="font-medium text-blue-900">
                    {workdayDuration.hours}h {workdayDuration.minutes}m
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Productivity Window:</span>
                  <span className="font-medium text-green-900">
                    {settings.startTime} - {settings.endTime}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-700">Break Frequency:</span>
                  <span className="font-medium text-orange-900">
                    Every {settings.breakDuration} minutes
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                Optimization Tips
              </h4>
              <div className="space-y-3 text-sm">
                {workdayDuration.totalMinutes < 360 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-800 mb-1">⚡ Short Day Detected</div>
                    <div className="text-yellow-700">Consider extending your workday for better task completion.</div>
                  </div>
                )}
                
                {settings.breakDuration < 10 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-medium text-orange-800 mb-1">⏰ Quick Breaks</div>
                    <div className="text-orange-700">Short breaks may lead to burnout. Consider 15-20 minute breaks.</div>
                  </div>
                )}
                
                {settings.breakDuration > 30 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="font-medium text-blue-800 mb-1">🧘 Extended Breaks</div>
                    <div className="text-blue-700">Long breaks are great for deep rest but may reduce daily capacity.</div>
                  </div>
                )}
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-800 mb-1">💡 Pro Tip</div>
                  <div className="text-green-700">
                    {workdayDuration.totalMinutes > 480 
                      ? "Long workdays benefit from 20-30 minute breaks to maintain focus."
                      : "Shorter workdays work well with 10-15 minute breaks for efficiency."
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="card-elevated bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">🧠 How ZenJourney Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-purple-800">Smart Prioritization</h4>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Tasks are scored based on urgency, importance, and effort required</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Higher priority tasks are automatically scheduled first</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Time decay increases urgency for older tasks</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-purple-800">Intelligent Scheduling</h4>
              <ul className="space-y-2 text-sm text-purple-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Breaks are automatically inserted between tasks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Tasks that don't fit are flagged for rescheduling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Your settings ensure realistic and sustainable schedules</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/60 rounded-lg border border-purple-200">
            <div className="text-center">
              <div className="text-sm font-medium text-purple-800 mb-2">💾 Auto-Save Enabled</div>
              <div className="text-xs text-purple-600">
                Your settings are automatically saved and will persist between sessions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};