import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type DatabaseType = 'asf' | 'sieg';

interface DatabaseConfig {
  name: string;
  url: string;
  anonKey: string;
}

const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  asf: {
    name: 'ASF Finance',
    url: 'https://wrebkgazdlyjenbpexnc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyZWJrZ2F6ZGx5amVuYnBleG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1ODgzMTQsImV4cCI6MjA3NTE2NDMxNH0.P2miUZA3TX0ofUEhIdEkwGq-oruyDPiC1GjEcQkun7w'
  },
  sieg: {
    name: 'SIEG',
    url: 'https://vrbgptrmmvsaoozrplng.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYmdwdHJtbXZzYW9venJwbG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTQxNDgsImV4cCI6MjA3NjM5MDE0OH0.q7GPpHQxCG-V5J0BZlKZoPy57XJiQCqLCA1Ya72HxPI'
  }
};

interface DatabaseContextType {
  currentDatabase: DatabaseType;
  databaseName: string;
  supabase: SupabaseClient<Database>;
  setDatabase: (database: DatabaseType) => void;
  availableDatabases: Array<{ id: DatabaseType; name: string }>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const STORAGE_KEY = 'zion-selected-database';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [currentDatabase, setCurrentDatabase] = useState<DatabaseType>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'sieg' ? 'sieg' : 'asf') as DatabaseType;
  });

  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database>>(() => {
    const config = DATABASE_CONFIGS[currentDatabase];
    return createSupabaseClient(config.url, config.anonKey);
  });

  const setDatabase = (database: DatabaseType) => {
    setCurrentDatabase(database);
    localStorage.setItem(STORAGE_KEY, database);
    
    // Criar novo client
    const config = DATABASE_CONFIGS[database];
    const newClient = createSupabaseClient(config.url, config.anonKey);
    setSupabaseClient(newClient);
  };

  const availableDatabases = Object.entries(DATABASE_CONFIGS).map(([id, config]) => ({
    id: id as DatabaseType,
    name: config.name
  }));

  const value: DatabaseContextType = {
    currentDatabase,
    databaseName: DATABASE_CONFIGS[currentDatabase].name,
    supabase: supabaseClient,
    setDatabase,
    availableDatabases
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
