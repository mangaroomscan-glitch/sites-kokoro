import React, { useState } from "react";
import { X, User, Image, Save, AlertCircle, Crown } from "lucide-react";
import { DBService } from "../firebase";

interface ProfileModalProps {
  currentUser: any;
  onClose: () => void;
  onProfileUpdated: (user: any) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ currentUser, onClose, onProfileUpdated }) => {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwner = currentUser?.email?.toLowerCase() === "konozuba1k@gmail.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await DBService.updateUserProfile(currentUser, displayName, photoURL);
      onProfileUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || "Nao foi possivel atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose}></div>

      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
          <div>
            <h2 className="text-base font-black text-white">Editar Perfil</h2>
            <p className="text-xs text-zinc-500">Altere seu nome e foto por URL.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.uid}`}
              alt="Preview"
              className="w-16 h-16 rounded-full object-cover border border-zinc-800 bg-zinc-900"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-200 truncate flex items-center gap-1.5">
                {displayName || "Seu nome"}
                {isOwner && <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />}
              </p>
              <p className="text-xs text-zinc-500 truncate">{currentUser.email}</p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nome de exibicao</span>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Seu nome na scan"
              />
            </div>
          </label>

          <label className="block space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">URL da foto</span>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-red-500"
                placeholder="https://exemplo.com/sua-foto.png"
              />
            </div>
          </label>
        </div>

        <div className="p-5 border-t border-zinc-900 bg-zinc-900/20 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold hover:bg-zinc-800 cursor-pointer">
            Cancelar
          </button>
          <button disabled={loading} className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-500 disabled:opacity-50 cursor-pointer flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Salvar Perfil"}
          </button>
        </div>
      </form>
    </div>
  );
};