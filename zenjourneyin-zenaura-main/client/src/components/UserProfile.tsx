import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { User, Trophy, Clock, Target, TrendingUp } from 'lucide-react';
import { UserProfile } from '../hooks/useFirebaseProfile';

interface UserProfileProps {
  profile: UserProfile | null;
  syncStatus?: 'synced' | 'syncing' | 'error';
}

export const UserProfileCard: React.FC<UserProfileProps> = ({ 
  profile, 
  syncStatus = 'synced' 
}) => {
  if (!profile) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Profile loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = profile.stats.totalTasks > 0 
    ? Math.round((profile.stats.completedTasks / profile.stats.totalTasks) * 100) 
    : 0;

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Syncing...';
      case 'error': return 'Sync Error';
      default: return 'Synced';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Profile
          </CardTitle>
          <Badge variant="outline" className={`text-xs ${getSyncStatusColor()}`}>
            {getSyncStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.photoURL} alt={profile.displayName} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
              {profile.displayName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {profile.email}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Total Tasks</div>
              <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {profile.stats.totalTasks}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
              <div className="text-sm font-semibold text-green-900 dark:text-green-100">
                {profile.stats.completedTasks}
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Completion Rate
            </span>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
              {completionRate}%
            </span>
          </div>
          <Progress 
            value={completionRate} 
            className="h-2"
          />
        </div>

        {/* Work Days */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Work Days</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {profile.stats.totalWorkDays}
          </span>
        </div>

        {/* Member Since */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
          Member since {profile.createdAt.toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};