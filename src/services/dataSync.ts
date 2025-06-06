
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApplicantData {
  id: string;
  full_name: string;
  nationality: string;
  area?: string;
  phone_number: string;
  passport_number?: string;
  date_of_birth: string;
  expiry_date?: string;
  visa_type?: string;
  occupation?: string;
  status: string;
  photo?: string;
  date_created: string;
  id_card_approved?: boolean;
}

class DataSyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncData();
      toast.success('Back online - syncing data...');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      toast.info('Working offline - data will sync when reconnected');
    });
  }

  // Check if we're online
  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  // Get all applicants (from Supabase if online, localStorage if offline)
  async getApplicants(): Promise<ApplicantData[]> {
    try {
      if (this.isOnline) {
        const { data, error } = await supabase
          .from('applicants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cache data locally
        if (data) {
          localStorage.setItem('applicants', JSON.stringify(data));
          return data;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch from Supabase, using local data:', error);
    }

    // Fallback to localStorage
    const localData = localStorage.getItem('applicants');
    return localData ? JSON.parse(localData) : this.getDefaultApplicants();
  }

  // Save applicant (to Supabase if online, localStorage always)
  async saveApplicant(applicant: ApplicantData): Promise<void> {
    // Always save to localStorage first
    const localApplicants = await this.getLocalApplicants();
    const existingIndex = localApplicants.findIndex(a => a.id === applicant.id);
    
    if (existingIndex >= 0) {
      localApplicants[existingIndex] = applicant;
    } else {
      localApplicants.push(applicant);
    }
    
    localStorage.setItem('applicants', JSON.stringify(localApplicants));

    // Mark for sync if offline
    if (!this.isOnline) {
      this.markForSync(applicant.id, 'upsert');
      toast.info('Saved locally - will sync when online');
      return;
    }

    // Try to save to Supabase if online
    try {
      const { error } = await supabase
        .from('applicants')
        .upsert(applicant);

      if (error) throw error;
      
      // Remove from pending sync if successful
      this.removePendingSync(applicant.id);
    } catch (error) {
      console.error('Failed to save to Supabase:', error);
      this.markForSync(applicant.id, 'upsert');
      toast.warning('Saved locally - will sync when connection improves');
    }
  }

  // Delete applicant
  async deleteApplicant(id: string): Promise<void> {
    // Remove from localStorage
    const localApplicants = await this.getLocalApplicants();
    const filtered = localApplicants.filter(a => a.id !== id);
    localStorage.setItem('applicants', JSON.stringify(filtered));

    if (!this.isOnline) {
      this.markForSync(id, 'delete');
      return;
    }

    // Try to delete from Supabase if online
    try {
      const { error } = await supabase
        .from('applicants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      this.removePendingSync(id);
    } catch (error) {
      console.error('Failed to delete from Supabase:', error);
      this.markForSync(id, 'delete');
    }
  }

  // Sync pending changes when back online
  async syncData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    
    try {
      const pendingSync = this.getPendingSync();
      const localApplicants = await this.getLocalApplicants();

      for (const item of pendingSync) {
        try {
          if (item.action === 'upsert') {
            const applicant = localApplicants.find(a => a.id === item.id);
            if (applicant) {
              const { error } = await supabase
                .from('applicants')
                .upsert(applicant);
              
              if (!error) {
                this.removePendingSync(item.id);
              }
            }
          } else if (item.action === 'delete') {
            const { error } = await supabase
              .from('applicants')
              .delete()
              .eq('id', item.id);
            
            if (!error) {
              this.removePendingSync(item.id);
            }
          }
        } catch (error) {
          console.error(`Failed to sync ${item.action} for ${item.id}:`, error);
        }
      }

      // Fetch latest data from server
      const { data } = await supabase
        .from('applicants')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        localStorage.setItem('applicants', JSON.stringify(data));
        toast.success('Data synchronized successfully');
      }

    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync some changes');
    } finally {
      this.syncInProgress = false;
    }
  }

  // Helper methods
  private async getLocalApplicants(): Promise<ApplicantData[]> {
    const localData = localStorage.getItem('applicants');
    return localData ? JSON.parse(localData) : this.getDefaultApplicants();
  }

  private markForSync(id: string, action: 'upsert' | 'delete'): void {
    const pendingSync = this.getPendingSync();
    const existing = pendingSync.find(item => item.id === id);
    
    if (existing) {
      existing.action = action;
    } else {
      pendingSync.push({ id, action, timestamp: Date.now() });
    }
    
    localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
  }

  private removePendingSync(id: string): void {
    const pendingSync = this.getPendingSync();
    const filtered = pendingSync.filter(item => item.id !== id);
    localStorage.setItem('pendingSync', JSON.stringify(filtered));
  }

  private getPendingSync(): Array<{ id: string; action: 'upsert' | 'delete'; timestamp: number }> {
    const pending = localStorage.getItem('pendingSync');
    return pending ? JSON.parse(pending) : [];
  }

  private getDefaultApplicants(): ApplicantData[] {
    return [
      {
        id: 'GIS-123456789',
        full_name: 'Ahmed Mohammed',
        nationality: 'Egyptian',
        passport_number: 'A12345678',
        date_of_birth: '1985-03-15',
        visa_type: 'Work',
        status: 'approved',
        date_created: '2023-07-10',
        occupation: 'Engineer',
        phone_number: '+233123456789',
        area: 'Accra',
      },
      {
        id: 'GIS-234567890',
        full_name: 'Maria Sanchez',
        nationality: 'Mexican',
        passport_number: 'B87654321',
        date_of_birth: '1990-11-22',
        visa_type: 'Student',
        status: 'pending',
        date_created: '2023-08-05',
        occupation: 'Student',
        phone_number: '+233987654321',
        area: 'Kumasi',
      }
    ];
  }
}

export const dataSyncService = new DataSyncService();
