import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, Database, AlertTriangle, CheckCircle, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createFirebaseStorage } from '../lib/firebaseStorage';
import { useAuth } from '../hooks/useAuth';

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
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleMigration = async () => {
    if (!isFirebaseConnected) {
      toast({
        title: "Firebase Not Connected",
        description: "Please sign in with Google to enable Firebase sync.",
        variant: "destructive"
      });
      return;
    }

    if (!hasLocalData) {
      toast({
        title: "No Local Data",
        description: "No local data found to migrate.",
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
      console.error('Migration error:', error);
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "Failed to migrate data. Please try again.",
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
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!user?.uid || !isFirebaseConnected) {
      toast({
        title: "Backup Not Available",
        description: "Please sign in with Google to create backups.",
        variant: "destructive"
      });
      return;
    }

    setCreatingBackup(true);
    try {
      const storage = createFirebaseStorage(user.uid);
      const backupId = await storage.createBackup();
      
      toast({
        title: "Backup Created",
        description: `Backup created successfully with ID: ${backupId.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: error instanceof Error ? error.message : "Failed to create backup. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your data storage, backups, and synchronization
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Alert>
            <div className="flex items-center gap-2">
              {isFirebaseConnected ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              <AlertDescription>
                <strong>Firebase:</strong> {isFirebaseConnected ? 'Connected' : 'Not Connected'}
              </AlertDescription>
            </div>
          </Alert>

          <Alert>
            <div className="flex items-center gap-2">
              {hasLocalData ? (
                <Database className="h-4 w-4 text-blue-500" />
              ) : (
                <Database className="h-4 w-4 text-gray-400" />
              )}
              <AlertDescription>
                <strong>Local Data:</strong> {hasLocalData ? 'Available' : 'None'}
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {/* Migration Status */}
        {hasLocalData && !isFirebaseConnected && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have local data that can be migrated to Firebase for better sync across devices.
              Sign in with Google to enable cloud synchronization.
            </AlertDescription>
          </Alert>
        )}

        {/* Migration Progress */}
        {migrating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Migrating data to Firebase...</span>
              <span>{migrationProgress}%</span>
            </div>
            <Progress value={migrationProgress} className="w-full" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            onClick={handleCreateBackup}
            disabled={!isFirebaseConnected || creatingBackup}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {creatingBackup ? 'Creating...' : 'Create Backup'}
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

        {/* Feature Comparison */}
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Storage Comparison</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Local Storage</h5>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Works offline</li>
                <li>• Single device only</li>
                <li>• No backup protection</li>
                <li>• Limited storage space</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Firebase Cloud</h5>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>• Syncs across devices</li>
                <li>• Automatic backups</li>
                <li>• Real-time updates</li>
                <li>• Secure & reliable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 border-t pt-4">
          <p><strong>Migration:</strong> Moves your local data to Firebase for cloud sync</p>
          <p><strong>Backup:</strong> Creates a secure copy of your Firebase data</p>
          <p><strong>Export:</strong> Downloads a JSON file of your current data</p>
          <p><strong>Note:</strong> All operations are secure and your data remains private</p>
        </div>
      </CardContent>
    </Card>
  );
};