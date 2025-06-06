
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { dataSyncService } from '@/services/dataSync';
import { toast } from 'sonner';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    setSyncing(true);
    try {
      await dataSyncService.syncData();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center gap-1">
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? 'Online' : 'Offline'}
      </Badge>
      
      {isOnline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualSync}
          disabled={syncing}
          className="h-6 px-2"
        >
          <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};

export default ConnectionStatus;
