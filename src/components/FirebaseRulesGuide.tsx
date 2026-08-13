import React, { useState } from "react";
import { X, Copy, Check, Shield, Database, Sparkles, BookOpen } from "lucide-react";

interface FirebaseRulesGuideProps {
  onClose: () => void;
}

export const FirebaseRulesGuide: React.FC<FirebaseRulesGuideProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const rulesCode = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Regra para Perfil e Favoritos do Usuário
    match /users/{userId} {
      // Qualquer um pode ler, mas apenas o próprio usuário autenticado pode salvar/editar seus favoritos
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Contador publico de visualizacoes dos mangas
    match /mangaStats/{mangaId} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if false;
    }

    // Regra para os Comentários e Respostas de cada Mangá
    match /mangas/{mangaId}/comments/{commentId} {
      
      // Permitir leitura pública dos comentários
      allow read: if true;
      
      // Permitir criação se o usuário estiver autenticado e o userId do comentário for o dele
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Permitir atualização (curtir ou adicionar respostas/replies)
      // Se for edição de texto, só o autor pode. Se for like/reply, permite respeitando a autoria original do post
      allow update: if request.auth != null && (
        (resource.data.userId == request.auth.uid && request.resource.data.userId == request.auth.uid)
        || 
        (request.resource.data.userId == resource.data.userId)
      );
      
      // DELETAR: Apenas quem fez o próprio comentário pode apagá-lo!
      allow delete: if request.auth != null 
                    && resource.data.userId == request.auth.uid;
    }
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rulesCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-zinc-100 flex items-center gap-1.5">
                Regras de Segurança do Firebase
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-zinc-400">Copie e cole no console do seu Firestore Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">
          
          <div className="space-y-2">
            <h3 className="font-bold text-zinc-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Como configurar no Firebase Console?
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-zinc-400 pl-1">
              <li>Acesse o <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-red-400 hover:underline">Firebase Console</a> e selecione seu projeto <b>kokoro-scans</b>.</li>
              <li>No menu lateral esquerdo, clique em <b>Firestore Database</b>.</li>
              <li>Clique na aba <b>Regras (Rules)</b> na parte superior central.</li>
              <li>Substitua todo o conteúdo existente pelo código abaixo.</li>
              <li>Clique no botão azul <b>Publicar (Publish)</b> no canto superior direito!</li>
            </ol>
          </div>

          {/* Code Box */}
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white text-xs font-bold transition-all cursor-pointer border border-zinc-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Regras</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="text-xs text-zinc-500 font-mono mb-1 flex items-center gap-2 pl-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>firestore.rules</span>
            </div>
            
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed">
              {rulesCode}
            </pre>
          </div>

          {/* Explanation of Security Constraints */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 space-y-3.5">
            <h4 className="font-bold text-xs text-zinc-200 uppercase tracking-widest">
              🔒 O Que Essas Regras Garantem de Forma Segura?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
                <span className="font-semibold text-red-400 block mb-1">💬 Comentários Livres</span>
                Qualquer visitante pode ver os comentários. Somente usuários logados podem comentar e responder.
              </div>
              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
                <span className="font-semibold text-red-400 block mb-1">❤️ Sistema de Likes</span>
                Os usuários podem interagir curtindo e descurtindo os comentários sem alterar as informações do autor do post.
              </div>
              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
                <span className="font-semibold text-red-400 block mb-1">🛡️ Deleção Restrita</span>
                <b>Apenas o autor de um comentário ou resposta tem o poder de apagá-lo.</b> Ninguém pode excluir comentários de terceiros!
              </div>
              <div className="p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
                <span className="font-semibold text-red-400 block mb-1">⭐ Biblioteca Protegida</span>
                Os favoritos são salvos debaixo do ID de cada usuário, garantindo que ninguém altere os dados de outro usuário.
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition-all cursor-pointer"
          >
            Entendido, Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
