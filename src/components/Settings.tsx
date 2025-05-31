
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Settings as SettingsIcon, Clock, Coffee } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {/* Workday Configuration */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Workday Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={settings.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="endTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={settings.endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Coffee className="w-4 h-4" />
              Break Duration: {settings.breakDuration} minutes
            </Label>
            <Slider
              value={[settings.breakDuration]}
              onValueChange={handleBreakDurationChange}
              max={60}
              min={5}
              step={5}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 min</span>
              <span>60 min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workday Summary */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle>Workday Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {workdayDuration.hours}h {workdayDuration.minutes}m
              </div>
              <div className="text-sm text-gray-600">Total Duration</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {settings.startTime}
              </div>
              <div className="text-sm text-gray-600">Start Time</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {settings.endTime}
              </div>
              <div className="text-sm text-gray-600">End Time</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Break between tasks:</span>
              <span className="text-sm font-bold text-orange-600">{settings.breakDuration} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips and Information */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle>Productivity Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Tasks are automatically scheduled based on their priority scores, which consider urgency, importance, and effort.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Break duration is added between each task to prevent burnout and maintain focus.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>If tasks don't fit in your workday, consider breaking them into smaller chunks or extending your work hours.</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Your settings are automatically saved and will persist between sessions.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
