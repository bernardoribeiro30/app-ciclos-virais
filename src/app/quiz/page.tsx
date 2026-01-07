"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Moon, ArrowRight, ArrowLeft, Check, Calendar, Activity, Heart, Pill, Smile } from "lucide-react";

type QuizStep = 1 | 2 | 3 | 4 | 5;

interface QuizData {
  age: number | null;
  weight: number | null;
  height: number | null;
  last_period_date: string;
  cycle_length: number;
  period_length: number;
  symptoms: string[];
  health_conditions: string[];
  medications: string[];
  lifestyle_notes: string;
}

const symptomOptions = [
  "Cólicas intensas",
  "TPM severa",
  "Fluxo intenso",
  "Fluxo irregular",
  "Dores de cabeça",
  "Náuseas",
  "Inchaço",
  "Alterações de humor",
  "Fadiga",
  "Insônia",
];

const healthConditionOptions = [
  "SOP (Síndrome dos Ovários Policísticos)",
  "Endometriose",
  "Miomas",
  "Diabetes",
  "Hipertensão",
  "Tireoide",
  "Nenhuma condição",
];

export default function QuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<QuizStep>(1);
  const [saving, setSaving] = useState(false);
  const [quizData, setQuizData] = useState<QuizData>({
    age: null,
    weight: null,
    height: null,
    last_period_date: "",
    cycle_length: 28,
    period_length: 5,
    symptoms: [],
    health_conditions: [],
    medications: [],
    lifestyle_notes: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Verificar se usuário já completou o quiz
    const checkQuizCompletion = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("user_quiz_data")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        // Usuário já completou o quiz, redirecionar para home
        router.push("/");
      }
    };

    checkQuizCompletion();
  }, [user, router]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as QuizStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as QuizStep);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item);
    }
    return [...array, item];
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("user_quiz_data").insert({
        user_id: user.id,
        age: quizData.age,
        weight: quizData.weight,
        height: quizData.height,
        last_period_date: quizData.last_period_date || null,
        cycle_length: quizData.cycle_length,
        period_length: quizData.period_length,
        symptoms: quizData.symptoms,
        health_conditions: quizData.health_conditions,
        medications: quizData.medications,
        lifestyle_notes: quizData.lifestyle_notes,
      });

      if (error) throw error;

      // Atualizar perfil com dados do ciclo
      await supabase
        .from("profiles")
        .update({
          cycle_length: quizData.cycle_length,
          period_length: quizData.period_length,
        })
        .eq("id", user.id);

      router.push("/");
    } catch (error) {
      console.error("Erro ao salvar quiz:", error);
      alert("Erro ao salvar dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return quizData.age && quizData.weight && quizData.height;
      case 2:
        return quizData.last_period_date && quizData.cycle_length && quizData.period_length;
      case 3:
        return true; // Sintomas são opcionais
      case 4:
        return true; // Condições são opcionais
      case 5:
        return true; // Notas são opcionais
      default:
        return false;
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
              <Moon className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Luna
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Vamos conhecer você melhor para personalizar sua experiência
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Etapa {currentStep} de 5
            </span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round((currentStep / 5) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Step 1: Dados Básicos */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Informações Básicas
                </h2>
                <p className="text-gray-600">
                  Esses dados nos ajudam a personalizar suas recomendações
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Idade
                </label>
                <input
                  type="number"
                  value={quizData.age || ""}
                  onChange={(e) =>
                    setQuizData({ ...quizData, age: parseInt(e.target.value) || null })
                  }
                  placeholder="Ex: 25"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={quizData.weight || ""}
                    onChange={(e) =>
                      setQuizData({ ...quizData, weight: parseFloat(e.target.value) || null })
                    }
                    placeholder="Ex: 65"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={quizData.height || ""}
                    onChange={(e) =>
                      setQuizData({ ...quizData, height: parseFloat(e.target.value) || null })
                    }
                    placeholder="Ex: 165"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ciclo Menstrual */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Seu Ciclo Menstrual
                </h2>
                <p className="text-gray-600">
                  Essas informações nos ajudam a prever seu próximo ciclo
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data da última menstruação
                </label>
                <input
                  type="date"
                  value={quizData.last_period_date}
                  onChange={(e) =>
                    setQuizData({ ...quizData, last_period_date: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duração média do ciclo (dias)
                </label>
                <input
                  type="number"
                  value={quizData.cycle_length}
                  onChange={(e) =>
                    setQuizData({ ...quizData, cycle_length: parseInt(e.target.value) || 28 })
                  }
                  placeholder="Ex: 28"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Geralmente entre 21 e 35 dias
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duração da menstruação (dias)
                </label>
                <input
                  type="number"
                  value={quizData.period_length}
                  onChange={(e) =>
                    setQuizData({ ...quizData, period_length: parseInt(e.target.value) || 5 })
                  }
                  placeholder="Ex: 5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Geralmente entre 3 e 7 dias
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Sintomas */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Sintomas Comuns
                </h2>
                <p className="text-gray-600">
                  Selecione os sintomas que você costuma sentir (opcional)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {symptomOptions.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() =>
                      setQuizData({
                        ...quizData,
                        symptoms: toggleArrayItem(quizData.symptoms, symptom),
                      })
                    }
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      quizData.symptoms.includes(symptom)
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{symptom}</span>
                      {quizData.symptoms.includes(symptom) && (
                        <Check className="w-5 h-5 text-pink-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Condições de Saúde */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pill className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Condições de Saúde
                </h2>
                <p className="text-gray-600">
                  Selecione condições que você possui (opcional)
                </p>
              </div>

              <div className="space-y-3">
                {healthConditionOptions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() =>
                      setQuizData({
                        ...quizData,
                        health_conditions: toggleArrayItem(
                          quizData.health_conditions,
                          condition
                        ),
                      })
                    }
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      quizData.health_conditions.includes(condition)
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{condition}</span>
                      {quizData.health_conditions.includes(condition) && (
                        <Check className="w-5 h-5 text-pink-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medicamentos que você usa (opcional)
                </label>
                <textarea
                  value={quizData.medications.join(", ")}
                  onChange={(e) =>
                    setQuizData({
                      ...quizData,
                      medications: e.target.value
                        .split(",")
                        .map((m) => m.trim())
                        .filter((m) => m),
                    })
                  }
                  placeholder="Ex: Anticoncepcional, Ibuprofeno..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe por vírgulas
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Estilo de Vida */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smile className="w-8 h-8 text-pink-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Estilo de Vida
                </h2>
                <p className="text-gray-600">
                  Conte-nos um pouco sobre sua rotina (opcional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observações sobre seu estilo de vida
                </label>
                <textarea
                  value={quizData.lifestyle_notes}
                  onChange={(e) =>
                    setQuizData({ ...quizData, lifestyle_notes: e.target.value })
                  }
                  placeholder="Ex: Pratico exercícios 3x por semana, trabalho em escritório, durmo bem..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-pink-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 mb-2">
                  🎉 Quase lá!
                </h3>
                <p className="text-sm text-gray-600">
                  Com essas informações, vamos personalizar sua experiência no Luna
                  para que você tenha o melhor acompanhamento do seu ciclo menstrual.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </button>
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Próximo
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-2xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? "Salvando..." : "Finalizar"}
                <Check className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
