import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, CornerDownRight, Trash2, Smile, Send, ChevronDown, ChevronUp, AlertCircle, Crown, ImagePlus, RefreshCw, X } from "lucide-react";
import { DBService, Comment } from "../firebase";

interface CommentSectionProps {
  mangaId: string;
  currentUser: any | null;
  onOpenLogin: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ mangaId, currentUser, onOpenLogin }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Track open reply forms for each comment ID
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  
  // Track showing replies list
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [gifOptions, setGifOptions] = useState<string[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);

  // Quick emojis for insertion
  const EMOJIS = ["🔥", "❤️", "😮", "👑", "😭", "😂", "🤯", "👏"];

  const isOwnerEmail = (email?: string) => email?.toLowerCase() === "konozuba1k@gmail.com";

  const loadAnimeGifs = async () => {
    setGifLoading(true);
    setActionError(null);
    try {
      const categories = ["happy", "smile", "laugh", "wink", "wave"];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const response = await fetch(`https://nekos.best/api/v2/${category}?amount=8`);
      const data = await response.json();
      setGifOptions((data.results || []).map((item: { url: string }) => item.url));
    } catch (err) {
      console.error("Error loading anime gifs:", err);
      setActionError("Nao foi possivel carregar GIFs agora.");
    } finally {
      setGifLoading(false);
    }
  };

  const loadComments = async () => {
    setLoadingComments(true);
    setActionError(null);
    try {
      const fetched = await DBService.getComments(mangaId);
      setComments(fetched);
    } catch (err: any) {
      console.error("Error loading comments:", err);
      setActionError("Erro ao carregar comentários.");
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadComments();
    setActiveReplyCommentId(null);
    setReplyTexts({});
  }, [mangaId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!newCommentText.trim() && !selectedGif) return;

    setSubmitting(true);
    setActionError(null);
    try {
      const added = await DBService.addComment(mangaId, currentUser, newCommentText.trim(), selectedGif || undefined);
      // Insert at the top
      setComments((prev) => [added, ...prev]);
      setNewCommentText("");
      setSelectedGif(null);
    } catch (err: any) {
      setActionError(err.message || "Erro ao publicar comentário.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    try {
      const updated = await DBService.likeComment(mangaId, commentId, currentUser.uid);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: updated.likes } : c))
      );
    } catch (err: any) {
      console.error("Error liking comment:", err);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    const replyText = replyTexts[commentId];
    if (!replyText || !replyText.trim()) return;

    setActionError(null);
    try {
      const updated = await DBService.replyToComment(mangaId, commentId, currentUser, replyText.trim());
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, replies: updated.replies } : c))
      );
      // Reset reply inputs
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
      setActiveReplyCommentId(null);
      // Auto-expand replies list
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    } catch (err: any) {
      setActionError(err.message || "Erro ao publicar resposta.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Deseja realmente apagar o seu comentário?")) return;

    try {
      const success = await DBService.deleteComment(mangaId, commentId, currentUser.uid);
      if (success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err: any) {
      alert(err.message || "Não foi possível excluir o comentário.");
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!currentUser) return;
    if (!window.confirm("Deseja realmente apagar a sua resposta?")) return;

    try {
      const updated = await DBService.deleteReply(mangaId, commentId, replyId, currentUser.uid);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, replies: updated.replies } : c))
      );
    } catch (err: any) {
      alert(err.message || "Não foi possível excluir a resposta.");
    }
  };

  const insertEmoji = (emoji: string) => {
    setNewCommentText((prev) => prev + emoji);
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Agora mesmo";
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Há ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Ontem";
    return `Há ${days} dias`;
  };

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 sm:p-6 shadow-xl space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-red-500" />
          <h3 className="text-base sm:text-lg font-black tracking-wide text-zinc-100">
            Comentários da Comunidade ({comments.length})
          </h3>
        </div>
        <button 
          onClick={loadComments}
          className="text-xs text-zinc-400 hover:text-white hover:underline transition-all cursor-pointer"
        >
          Atualizar lista
        </button>
      </div>

      {actionError && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Write Comment Box */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-850">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.uid}`}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-800 object-cover"
            />
            <div>
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                {currentUser.displayName}
                {isOwnerEmail(currentUser.email) && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
              </span>
              <p className="text-[10px] text-zinc-500">Escreva um comentário público</p>
            </div>
          </div>

          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="O que você achou desse mangá? Deixe sua teoria ou feedback! Seja amigável."
            rows={3}
            maxLength={500}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
          />

          {selectedGif && (
            <div className="relative w-fit rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
              <img src={selectedGif} alt="GIF selecionado" className="w-40 h-28 object-cover" />
              <button
                type="button"
                onClick={() => setSelectedGif(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {gifOptions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-zinc-950 border border-zinc-800 p-2">
              {gifOptions.map((gif) => (
                <button
                  key={gif}
                  type="button"
                  onClick={() => setSelectedGif(gif)}
                  className={`rounded-lg overflow-hidden border cursor-pointer ${selectedGif === gif ? "border-red-500" : "border-zinc-800"}`}
                >
                  <img src={gif} alt="Anime GIF" className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Quick Emojis */}
            <div className="flex items-center gap-1">
              <Smile className="w-4 h-4 text-zinc-500 mr-1.5 shrink-0" />
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-sm transition-all cursor-pointer active:scale-90"
                >
                  {emoji}
                </button>
              ))}
              <button
                type="button"
                onClick={loadAnimeGifs}
                className="h-7 px-2 flex items-center gap-1 rounded-lg hover:bg-zinc-800 text-xs text-zinc-300 transition-all cursor-pointer"
              >
                {gifLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                GIF
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || (!newCommentText.trim() && !selectedGif)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-md shadow-red-950/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Postando..." : "Comentar"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 text-center rounded-xl bg-zinc-900/30 border border-dashed border-zinc-800 space-y-3">
          <p className="text-sm text-zinc-400">
            Você precisa estar logado para deixar comentários, curtir ou responder!
          </p>
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-red-500 hover:text-red-400 border border-zinc-800 shadow-md transition-all cursor-pointer"
          >
            Fazer Login ou Criar Conta
          </button>
        </div>
      )}

      {/* Comments List */}
      {loadingComments ? (
        <div className="space-y-4 py-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 bg-zinc-800 rounded"></div>
                <div className="h-10 w-full bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 space-y-2">
          <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto stroke-1" />
          <p className="text-xs">Seja o primeiro a comentar! Digite acima e inicie o debate.</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-900 space-y-4">
          {comments.map((comment) => {
            const hasLiked = currentUser ? comment.likes?.includes(currentUser.uid) : false;
            const repliesCount = comment.replies?.length || 0;
            const isRepliesExpanded = expandedReplies[comment.id] || false;
            const isReplyingThis = activeReplyCommentId === comment.id;

            return (
              <div key={comment.id} className="pt-4 first:pt-0 space-y-3">
                
                {/* Main Comment Row */}
                <div className="flex gap-3">
                  <img
                    src={comment.userPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.userId}`}
                    alt={comment.userName}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-800 bg-zinc-900"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-zinc-200 hover:text-red-400 cursor-pointer">
                          {comment.userName}
                        </span>
                        {isOwnerEmail(comment.userEmail) && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        <span className="text-[10px] text-zinc-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      {/* Delete comment button - only if current user is owner */}
                      {currentUser && comment.userId === currentUser.uid && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900/60 transition-all cursor-pointer"
                          title="Excluir meu comentário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-zinc-300 mt-1.5 whitespace-pre-line leading-relaxed break-words pr-2">
                      {comment.text}
                    </p>
                    {comment.gifUrl && (
                      <img
                        src={comment.gifUrl}
                        alt="GIF do comentario"
                        className="mt-3 max-w-[220px] rounded-xl border border-zinc-800 object-cover"
                      />
                    )}

                    {/* Actions bar (Like, Reply, Expand Replies) */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      
                      {/* Like button */}
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center gap-1.5 hover:text-red-400 cursor-pointer transition-all ${hasLiked ? "text-red-500 font-bold scale-110" : ""}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-red-500 stroke-red-500" : ""}`} />
                        <span>{comment.likes?.length || 0}</span>
                      </button>

                      {/* Reply button */}
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            onOpenLogin();
                            return;
                          }
                          setActiveReplyCommentId(isReplyingThis ? null : comment.id);
                        }}
                        className={`hover:text-zinc-300 cursor-pointer transition-all ${isReplyingThis ? "text-red-400 font-bold" : ""}`}
                      >
                        {isReplyingThis ? "Cancelar" : "Responder"}
                      </button>

                      {/* Show replies count / Expand replies */}
                      {repliesCount > 0 && (
                        <button
                          onClick={() =>
                            setExpandedReplies((prev) => ({ ...prev, [comment.id]: !isRepliesExpanded }))
                          }
                          className="flex items-center gap-0.5 text-zinc-400 hover:text-white transition-all cursor-pointer font-medium ml-auto"
                        >
                          <span>
                            {isRepliesExpanded ? "Ocultar respostas" : `Ver ${repliesCount} respostas`}
                          </span>
                          {isRepliesExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline Reply Input */}
                {isReplyingThis && currentUser && (
                  <div className="pl-12 flex items-start gap-2.5 animate-slide-down">
                    <CornerDownRight className="w-4 h-4 text-zinc-600 mt-3 shrink-0" />
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder={`Responder para ${comment.userName}...`}
                        value={replyTexts[comment.id] || ""}
                        onChange={(e) => setReplyTexts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddReply(comment.id);
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all"
                      />
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!(replyTexts[comment.id] || "").trim()}
                        className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-red-600 hover:text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-200"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {isRepliesExpanded && repliesCount > 0 && (
                  <div className="pl-10 space-y-3.5 border-l-2 border-zinc-900/80 ml-4 sm:ml-5 pt-1">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2.5 items-start">
                        <CornerDownRight className="w-4.5 h-4.5 text-zinc-700 shrink-0 mt-1" />
                        
                        <img
                          src={reply.userPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${reply.userId}`}
                          alt={reply.userName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-zinc-800 bg-zinc-900"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-zinc-300 hover:text-red-400 cursor-pointer">
                                {reply.userName}
                              </span>
                              {isOwnerEmail(reply.userEmail) && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                              <span className="text-[9px] text-zinc-500">{formatDate(reply.createdAt)}</span>
                            </div>

                            {/* Delete Reply Button */}
                            {currentUser && reply.userId === currentUser.uid && (
                              <button
                                onClick={() => handleDeleteReply(comment.id, reply.id)}
                                className="p-0.5 rounded text-zinc-600 hover:text-red-400 transition-all cursor-pointer"
                                title="Excluir minha resposta"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 mt-1 bg-zinc-900/30 p-2 rounded-lg border border-zinc-850/30 leading-relaxed pr-2 break-words">
                            {reply.text}
                          </p>
                          {reply.gifUrl && (
                            <img src={reply.gifUrl} alt="GIF da resposta" className="mt-2 max-w-[180px] rounded-lg border border-zinc-800" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
