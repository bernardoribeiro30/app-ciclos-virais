"use client";

import { useState, useEffect } from "react";
import { Calendar, Heart, MessageCircle, BookOpen, User, Home, TrendingUp, Bell, Settings, Check, Users, Sparkles, Moon, Sun, Droplet, Activity, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Post, Cycle, Profile } from "@/lib/supabase";

export default function LunaApp() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hoje");
  const [selectedDate, setSelectedDate] = useState(15);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Redirecionar para auth se não estiver logado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Carregar perfil
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Carregar ciclos
      const { data: cyclesData } = await supabase
        .from("cycles")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: false })
        .limit(12);

      if (cyclesData) {
        setCycles(cyclesData);
      }

      // Carregar posts da comunidade
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (postsData) {
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLikePost = async (postId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ likes: currentLikes + 1 })
        .eq("id", postId);

      if (!error) {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: currentLikes + 1 } : p));
      }
    } catch (error) {
      console.error("Erro ao curtir post:", error);
    }
  };

  const handleRegisterPeriod = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase.from("cycles").insert({
        user_id: user.id,
        start_date: today,
        notes: "Registrado pelo app",
      });

      if (!error) {
        alert("Menstruação registrada com sucesso!");
        loadUserData();
      }
    } catch (error) {
      console.error("Erro ao registrar menstruação:", error);
    }
  };

  // Dados do calendário (dias do mês)
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const currentDay = 15;

  // Conteúdo educativo
  const content = [
    {
      id: 1,
      title: "Entenda seu ciclo",
      description: "Tudo sobre as fases do ciclo menstrual",
      color: "from-pink-400 to-rose-500",
      icon: <Moon className="w-6 h-6" />,
    },
    {
      id: 2,
      title: "Fertilidade",
      description: "Dias férteis e ovulação",
      color: "from-purple-400 to-pink-500",
      icon: <Sparkles className="w-6 h-6" />,
    },
    {
      id: 3,
      title: "Sintomas comuns",
      description: "Como lidar com TPM e cólicas",
      color: "from-rose-400 to-orange-400",
      icon: <Activity className="w-6 h-6" />,
    },
    {
      id: 4,
      title: "Saúde íntima",
      description: "Cuidados essenciais",
      color: "from-violet-400 to-purple-500",
      icon: <Heart className="w-6 h-6" />,
    },
  ];

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Moon className="w-9 h-9 text-white" />
          </div>
          <p className="text-gray-600 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Luna
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></span>
            </button>
            <button onClick={signOut} title="Sair">
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Hoje Tab */}
        {activeTab === "hoje" && (
          <div className="space-y-6">
            {/* Calendário Horizontal */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">Dezembro 2024</h2>
                <button className="text-sm text-purple-600 font-semibold">Ver mês completo</button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {days.slice(10, 25).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={`flex-shrink-0 w-12 h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      day === selectedDate
                        ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg scale-110"
                        : day === currentDay
                        ? "bg-pink-100 text-pink-600"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-xs font-medium">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][day % 7]}
                    </span>
                    <span className="text-lg font-bold">{day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status do Ciclo */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Fase atual</p>
                  <h3 className="text-2xl font-bold">Ovulação</h3>
                </div>
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Próxima menstruação</span>
                  <span className="font-bold text-lg">em 14 dias</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Dias férteis</span>
                  <span className="font-bold text-lg">Hoje - Amanhã</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-100">Ciclos registrados</span>
                  <span className="font-bold text-lg">{cycles.length}</span>
                </div>
              </div>
              <button 
                onClick={handleRegisterPeriod}
                className="w-full mt-4 bg-white text-purple-600 font-bold py-3 rounded-2xl hover:bg-purple-50 transition-all"
              >
                Registrar menstruação
              </button>
            </div>

            {/* Promoção Banner */}
            <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold mb-1">🎉 BLACK FRIDAY</p>
                  <h3 className="text-xl font-bold mb-2">Luna Premium</h3>
                  <p className="text-sm text-white/90">50% OFF - Termina em 2d 5h</p>
                </div>
                <button className="bg-white text-orange-600 font-bold px-6 py-3 rounded-2xl hover:bg-orange-50 transition-all">
                  Ver oferta
                </button>
              </div>
            </div>

            {/* Conteúdo do Dia */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Para você hoje</h3>
                <button className="text-sm text-purple-600 font-semibold">Ver tudo</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {content.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-gradient-to-br ${item.color} rounded-2xl p-5 text-white shadow-lg hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <div className="mb-3">{item.icon}</div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-white/90">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dicas Rápidas */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Dicas para hoje</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Droplet className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Hidrate-se mais</p>
                    <p className="text-sm text-gray-600">Beba pelo menos 2L de água hoje</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Exercícios leves</p>
                    <p className="text-sm text-gray-600">Yoga ou caminhada de 20min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comunidade Tab */}
        {activeTab === "comunidade" && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <button className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold whitespace-nowrap shadow-lg">
                  Populares
                </button>
                <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold whitespace-nowrap hover:bg-gray-200">
                  Minhas postagens
                </button>
                <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold whitespace-nowrap hover:bg-gray-200">
                  Seguindo
                </button>
                <button className="px-5 py-2 bg-gray-100 text-gray-700 rounded-full font-semibold whitespace-nowrap hover:bg-gray-200">
                  Salvos
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">Nenhum post ainda</p>
                  <p className="text-sm text-gray-500">Seja a primeira a compartilhar!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="border-b border-gray-100 last:border-0 py-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {post.user_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{post.user_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-pink-50 text-pink-600 text-xs font-semibold rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-gray-600">
                      <button 
                        onClick={() => handleLikePost(post.id, post.likes)}
                        className="flex items-center gap-2 hover:text-pink-600 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-semibold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-purple-600 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">{post.comments_count}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Categorias */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Categorias populares</h3>
                <button className="text-sm text-purple-600 font-semibold">Ver todas</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl text-left hover:scale-105 transition-transform">
                  <p className="font-bold text-pink-700 mb-1">Relacionamentos</p>
                  <p className="text-xs text-pink-600">{posts.length} posts</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl text-left hover:scale-105 transition-transform">
                  <p className="font-bold text-purple-700 mb-1">Sintomas</p>
                  <p className="text-xs text-purple-600">{posts.length} posts</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl text-left hover:scale-105 transition-transform">
                  <p className="font-bold text-orange-700 mb-1">Gravidez</p>
                  <p className="text-xs text-orange-600">{posts.length} posts</p>
                </button>
                <button className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl text-left hover:scale-105 transition-transform">
                  <p className="font-bold text-teal-700 mb-1">Bem-estar</p>
                  <p className="text-xs text-teal-600">{posts.length} posts</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo Tab */}
        {activeTab === "conteudo" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Aprenda mais sobre você</h2>
              <div className="space-y-4">
                {content.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 text-white shadow-lg hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                        <p className="text-sm text-white/90">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Artigos Recentes */}
            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Artigos recentes</h3>
              <div className="space-y-4">
                <div className="flex gap-4 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-colors">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Como identificar sua fase fértil</h4>
                    <p className="text-sm text-gray-600">Entenda os sinais do seu corpo</p>
                  </div>
                </div>
                <div className="flex gap-4 cursor-pointer hover:bg-gray-50 p-3 rounded-2xl transition-colors">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-violet-500 rounded-2xl flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">TPM: mitos e verdades</h4>
                    <p className="text-sm text-gray-600">Desmistificando a TPM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagens Tab */}
        {activeTab === "mensagens" && (
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mensagens</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    L
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-800">Luna Assistente</p>
                    <span className="text-xs text-gray-500">Agora</span>
                  </div>
                  <p className="text-sm text-gray-600">Olá! Como posso te ajudar hoje?</p>
                </div>
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  C
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-800">Comunidade Luna</p>
                    <span className="text-xs text-gray-500">1h atrás</span>
                  </div>
                  <p className="text-sm text-gray-600">Nova resposta no seu post</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  P
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-gray-800">Parceiro</p>
                    <span className="text-xs text-gray-500">2h atrás</span>
                  </div>
                  <p className="text-sm text-gray-600">Vincule sua conta para compartilhar</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Perfil Tab */}
        {activeTab === "perfil" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                  {profile?.name?.[0] || user.email?.[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{profile?.name || "Usuária"}</h2>
                  <p className="text-purple-100">{user.email}</p>
                </div>
              </div>
              <button className="w-full bg-white text-purple-600 font-bold py-3 rounded-2xl hover:bg-purple-50 transition-all">
                Editar perfil
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Estatísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-pink-50 rounded-2xl">
                  <p className="text-3xl font-bold text-pink-600 mb-1">{profile?.cycle_length || 28}</p>
                  <p className="text-sm text-gray-600">Dias de ciclo médio</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl">
                  <p className="text-3xl font-bold text-purple-600 mb-1">{profile?.period_length || 5}</p>
                  <p className="text-sm text-gray-600">Dias de menstruação</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl">
                  <p className="text-3xl font-bold text-rose-600 mb-1">{cycles.length}</p>
                  <p className="text-sm text-gray-600">Ciclos registrados</p>
                </div>
                <div className="p-4 bg-violet-50 rounded-2xl">
                  <p className="text-3xl font-bold text-violet-600 mb-1">94%</p>
                  <p className="text-sm text-gray-600">Precisão</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Configurações</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-700">Notificações</span>
                  <span className="text-gray-400">›</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-700">Privacidade</span>
                  <span className="text-gray-400">›</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-700">Modo casal</span>
                  <span className="text-gray-400">›</span>
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-700">Ajuda e suporte</span>
                  <span className="text-gray-400">›</span>
                </button>
                <button 
                  onClick={signOut}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-colors text-red-600"
                >
                  <span className="font-semibold">Sair da conta</span>
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <button
              onClick={() => setActiveTab("hoje")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === "hoje"
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Home className={`w-6 h-6 ${activeTab === "hoje" ? "fill-pink-600" : ""}`} />
              <span className="text-xs font-semibold">Hoje</span>
            </button>
            <button
              onClick={() => setActiveTab("comunidade")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === "comunidade"
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className={`w-6 h-6 ${activeTab === "comunidade" ? "fill-pink-600" : ""}`} />
              <span className="text-xs font-semibold">Comunidade</span>
            </button>
            <button
              onClick={() => setActiveTab("conteudo")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === "conteudo"
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className={`w-6 h-6 ${activeTab === "conteudo" ? "fill-pink-600" : ""}`} />
              <span className="text-xs font-semibold">Conteúdo</span>
            </button>
            <button
              onClick={() => setActiveTab("mensagens")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all relative ${
                activeTab === "mensagens"
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageCircle className={`w-6 h-6 ${activeTab === "mensagens" ? "fill-pink-600" : ""}`} />
              <span className="text-xs font-semibold">Mensagens</span>
              <span className="absolute top-1 right-2 w-2 h-2 bg-pink-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setActiveTab("perfil")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                activeTab === "perfil"
                  ? "text-pink-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <User className={`w-6 h-6 ${activeTab === "perfil" ? "fill-pink-600" : ""}`} />
              <span className="text-xs font-semibold">Perfil</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
