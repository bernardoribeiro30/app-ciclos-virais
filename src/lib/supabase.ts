import { createClient } from '@supabase/supabase-js';

// Obter variáveis de ambiente do cliente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validar credenciais
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Credenciais do Supabase não configuradas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Criar cliente Supabase com configurações simplificadas
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Verificar se o cliente está configurado corretamente
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Tipos do banco de dados
export type Profile = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  cycle_length: number;
  period_length: number;
};

export type Cycle = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  cycle_length: number;
  notes: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  tags: string[];
  likes: number;
  comments_count: number;
  created_at: string;
};

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type UserQuizData = {
  id: string;
  user_id: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  last_period_date: string | null;
  cycle_length: number;
  period_length: number;
  symptoms: string[];
  health_conditions: string[];
  medications: string[];
  lifestyle_notes: string;
  completed_at: string;
  created_at: string;
};
