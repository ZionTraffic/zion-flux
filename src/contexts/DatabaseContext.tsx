import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/integrations/supabase/client';
import { supabase as defaultSupabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type DatabaseType = string;

interface DatabaseConfig {
  id: string;
  name: string;
  database_key: string;
  url: string;
  anon_key: string;
  active: boolean;
}

interface DatabaseContextType {
  currentDatabase: string;
  databaseName: string;
  supabase: SupabaseClient<Database>;
  setDatabase: (databaseKey: string) => void;
  availableDatabases: Array<{ id: string; name: string }>;
  isLoading: boolean;
  refetchConfigs: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

const STORAGE_KEY = 'zion-selected-database';

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<DatabaseConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDatabase, setCurrentDatabase] = useState<string>('asf');
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient<Database>>(defaultSupabase);
  const [pendingDatabaseKey, setPendingDatabaseKey] = useState<string | null>(null);

  const fetchDatabaseConfigs = async () => {
    try {
      const { data, error } = await defaultSupabase
        .from('database_configs')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setConfigs(data);

        const stored = localStorage.getItem(STORAGE_KEY);
        const desiredKey = pendingDatabaseKey || stored || data[0].database_key;
        const config = data.find(c => c.database_key === desiredKey) || data[0];

        setCurrentDatabase(config.database_key);
        localStorage.setItem(STORAGE_KEY, config.database_key);

        // Usar storageKey baseado na URL, não no database_key
        // Isso evita múltiplas instâncias do GoTrueClient quando URLs são iguais
        const storageKey = `sb-${config.url.split('//')[1]?.split('.')[0] || 'default'}`;
        const client = createSupabaseClient(config.url, config.anon_key, storageKey);
        setSupabaseClient(client);
        setPendingDatabaseKey(null);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de banco:', error);
      // Não setar database padrão se houver erro - deixa undefined
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDatabase = (databaseKey: string) => {
    const config = configs.find(c => c.database_key === databaseKey);
    
    if (!config) {
      console.log("⏳ Aguardando banco", databaseKey, "carregar...");
      setPendingDatabaseKey(databaseKey);
      return;
    }

    setCurrentDatabase(databaseKey);
    localStorage.setItem(STORAGE_KEY, databaseKey);
    
    // Usar storageKey baseado na URL, não no database_key
    // Isso evita múltiplas instâncias do GoTrueClient quando URLs são iguais
    const storageKey = `sb-${config.url.split('//')[1]?.split('.')[0] || 'default'}`;
    const newClient = createSupabaseClient(config.url, config.anon_key, storageKey);
    setSupabaseClient(newClient);
  };

  const availableDatabases = configs.map(config => ({
    id: config.database_key,
    name: config.name
  }));

  const currentConfig = configs.find(c => c.database_key === currentDatabase);

  const value: DatabaseContextType = {
    currentDatabase,
    databaseName: currentConfig?.name || 'ASF Finance',
    supabase: supabaseClient,
    setDatabase,
    availableDatabases,
    isLoading,
    refetchConfigs: fetchDatabaseConfigs
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
