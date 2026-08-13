import React, { useState } from "react";
import { X, Mail, Lock, User, AlertCircle, Sparkles } from "lucide-react";
import { DBService } from "../firebase";

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user;
      if (isSignUp) {
        user = await DBService.signUpEmail(email, password, name);
      } else {
        user = await DBService.signInEmail(email, password);
      }
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await DBService.signInGoogle();
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro no login com o Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Background click */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10 transition-all duration-300">
        
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 relative flex items-end p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/40 text-zinc-300 hover:text-white hover:bg-black/60 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="z-10">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {isSignUp ? "Criar Nova Conta" : "Bem-vindo de Volta!"}
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-bounce" />
            </h2>
            <p className="text-xs text-white/80 font-medium">
              {isSignUp ? "Cadastre-se na Kokoro Scans para salvar seus mangás." : "Entre para gerenciar seus favoritos e comentar nos mangás!"}
            </p>
          </div>
          
          <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        </div>

        {/* Content Form */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Nome de Exibição
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Como quer ser chamado?"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Endereço de E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-500" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-lg shadow-red-950/20"
            >
              {loading ? "Processando..." : isSignUp ? "Criar Minha Conta" : "Entrar na Conta"}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-3 text-zinc-500 font-bold tracking-widest">OU ENTRE COM</span>
            </div>
          </div>

          {/* Google Sign-In button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com o Google</span>
          </button>

          {/* Toggle login modes */}
          <div className="mt-6 text-center text-xs text-zinc-500">
            {isSignUp ? (
              <p>
                Já possui uma conta?{" "}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-red-500 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Fazer Login
                </button>
              </p>
            ) : (
              <p>
                Ainda não tem conta?{" "}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-red-500 font-bold hover:underline ml-1 cursor-pointer"
                >
                  Registrar-se
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
