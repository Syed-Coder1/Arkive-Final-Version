import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { firebaseSync } from '../services/firebaseSync';

export const SyncStatus: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      const status = await firebaseSync.getSyncStatus();
      setSyncStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!syncStatus) return null;

  return (
    <>
      {/* Floating sync status indicator */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:scale-110 transition-transform"
        title="Sync Status"
      >
        {syncStatus.isOnline ? (
          syncStatus.queueLength > 0 ? (
            <Loader className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Cloud className="w-5 h-5 text-green-500" />
          )
        ) : (
          <CloudOff className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Detailed sync status panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sync Status</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
              <div className="flex items-center gap-2">
                {syncStatus.isOnline ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Offline</span>
                  </>
                )}
              </div>
            </div>

            {/* Pending Operations */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending Sync</span>
              <span className={`text-sm font-medium ${
                syncStatus.queueLength > 0
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {syncStatus.queueLength} operations
              </span>
            </div>

            {/* Last Sync Time */}
            {syncStatus.lastSync && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(syncStatus.lastSync).toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Device ID */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">Device ID</span>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1 break-all">
                {syncStatus.deviceId}
              </p>
            </div>
          </div>

          {/* Status Message */}
          {syncStatus.queueLength > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                {syncStatus.isOnline
                  ? 'Syncing data to cloud...'
                  : 'Data will sync when connection is restored'}
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Data syncs automatically across all devices when online.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
