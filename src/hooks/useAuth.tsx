"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      setError("Supabase não configurado. Clique em 'Configurar' no banner laranja acima.");
      setLoading(false);
      return;
    }

    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao verificar sessão:", sessionError);
          setError(sessionError.message);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
          setError(null);
        }
      } catch (err) {
        console.error("Erro ao verificar sessão:", err);
        setError("Erro de conexão. Verifique suas credenciais do Supabase.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_OUT') {
          setError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
        setError(error.message);
      } else {
        router.push("/auth");
      }
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      setError("Erro ao fazer logout");
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
  };
}
