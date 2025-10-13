import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useIsMasterUser = () => {
  const [isMaster, setIsMaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMasterUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsMaster(user?.email === 'george@ziontraffic.com.br');
      } catch (error) {
        console.error('Error checking master user:', error);
        setIsMaster(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkMasterUser();
  }, []);

  return { isMaster, isLoading };
};
