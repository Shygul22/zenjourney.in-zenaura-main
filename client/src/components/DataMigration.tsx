import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataMigrationProps {
  onMigrateToFirebase: () => Promise<void>;
  onExportData: () => Promise<void>;
  hasLocalData: boolean;
  isFirebaseConnected: boolean;
}

export const DataMigration: React.FC<DataMigrationProps> = ({
  onMigrateToFirebase,
  onExportData,
  hasLocalData,
  isFirebaseConnected
}) => {
  const [migrating, setMigrating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const { toast } = useToast();

  const handleMigration = async () => {
    if (!isFirebaseConnected) {
      toast({
        title: "Firebase Not Connected",
        description: "Please check your Firebase configuration and sign in.",
        variant: "destructive"
      });
      return;
    }

    setMigrating(true);
    setMigrationProgress(0);

    try {
      // Simulate migration progress
      const progressInterval = setInterval(() => {
        setMigrationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await onMigrateToFirebase();
      
      clearInterval(progressInterval);
      setMigrationProgress(100);
      
      toast({
        title: "Migration Complete",
        description: "Your data has been successfully migrated to Firebase.",
      });
    } catch (error) {
      toast({
        title: "Migration Failed",
        description: "Failed to migrate data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMigrating(false);
      setTimeout(() => setMigrationProgress(0), 2000);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExportData();
      toast({
        title: "Export Complete",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Firebase Connection Status */}
        <Alert>
          <div className="flex items-center gap-2">
            {isFirebaseConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
            <AlertDescription>
              Firebase: {isFirebaseConnected ? 'Connected' : 'Not Connected'}
            </AlertDescription>
          </div>
        </Alert>

        {/* Local Data Status */}
        {hasLocalData && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have local data that can be migrated to Firebase for better sync across devices.
            </AlertDescription>
          </Alert>
        )}

        {/* Migration Progress */}
        {migrating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Migrating data...</span>
              <span>{migrationProgress}%</span>
            </div>
            <Progress value={migrationProgress} className="w-full" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={handleMigration}
            disabled={!hasLocalData || !isFirebaseConnected || migrating}
            className="flex items-center gap-2"
            variant="default"
          >
            <Upload className="h-4 w-4" />
            {migrating ? 'Migrating...' : 'Migrate to Firebase'}
          </Button>

          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>

        {/* Info Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Migration moves your local data to Firebase for cloud sync</p>
          <p>• Export creates a backup file of your current data</p>
          <p>• Firebase data syncs across all your devices</p>
        </div>
      </CardContent>
    </Card>
  );
};