import React from "react";
import { 
  ArrowLeft, Heart, Eye, Calendar, User, BookOpen, Star, Sparkles, 
  Clock, Share2, Layers, Check
} from "lucide-react";
import { Manga, MangaChapter } from "../data/mangas";
import { CommentSection } from "./CommentSection";

interface MangaDetailProps {
  manga: Manga;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
  onSelectChapter: (chapter: MangaChapter) => void;
  currentUser: any | null;
  onOpenLogin: () => void;
}

export const MangaDetail: React.FC<MangaDetailProps> = ({
  manga,
  isFavorited,
  onToggleFavorite,
  onBack,
  onSelectChapter,
  currentUser,
  onOpenLogin
}) => {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link do mangá copiado para a área de transferência! 🚀");
  };

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen pb-16 animate-fade-in">
      
      {/* Dynamic Banner Header */}
      <div className="h-64 sm:h-96 relative w-full overflow-hidden border-b border-zinc-900">
        <img
          src={manga.bannerUrl}
          alt={manga.title}
          className="w-full h-full object-cover filter brightness-35 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        
        {/* Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black/60 hover:bg-black/80 text-white hover:text-red-500 font-extrabold text-xs transition-all shadow-lg cursor-pointer backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Catálogo</span>
          </button>
        </div>
      </div>

      {/* Main Content Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-40 relative z-10 space-y-8">
        
        {/* Upper presentation row */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end">
          
          {/* Cover Image overlap */}
          <div className="w-48 sm:w-60 h-72 sm:h-90 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl shrink-0 bg-zinc-900 transform hover:scale-102 transition-transform duration-300">
            <img
              src={manga.coverUrl}
              alt={manga.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Texts metadata */}
          <div className="flex-1 text-center md:text-left space-y-4">
            
            {/* Title & Type */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-red-600 text-white shadow-md shadow-red-950/40">
                  {manga.type.toUpperCase()}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  manga.status === "Ativo" 
                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5" 
                    : "border-zinc-700 text-zinc-400 bg-zinc-800/10"
                }`}>
                  {manga.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {manga.title}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-bold italic">
                {manga.alternativeTitle}
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-zinc-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-zinc-200">{manga.rating}</span>
              </div>
              <div className="h-4 w-[1px] bg-zinc-850"></div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-red-500" />
                <span className="text-zinc-200">{manga.views} Views</span>
              </div>
              <div className="h-4 w-[1px] bg-zinc-850"></div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span className="text-zinc-200">{manga.releaseYear}</span>
              </div>
            </div>

            {/* Action Buttons (Favorite / Share) */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3.5 pt-1">
              
              {/* Toggle Favorites Button */}
              <button
                onClick={() => {
                  if (!currentUser) {
                    onOpenLogin();
                  } else {
                    onToggleFavorite();
                  }
                }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                  isFavorited 
                    ? "bg-rose-600 text-white shadow-rose-950/20 hover:bg-rose-500 active:scale-95" 
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:text-white"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-white text-white scale-110 animate-pulse" : ""}`} />
                <span>{isFavorited ? "Salvo na Biblioteca!" : "Salvar em Favoritos"}</span>
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
                title="Copiar link do mangá"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
            </div>

          </div>
        </div>

        {/* Info Grid (Genres, Synopsis, details) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Synopsis & Chapter list left column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Synopsis card */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-5 sm:p-6 rounded-2xl space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-red-500" />
                Sinopse Detalhada
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line text-justify">
                {manga.synopsis}
              </p>
            </div>

            {/* Chapter List Card */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-5 sm:p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Layers className="w-4.5 h-4.5 text-red-500" />
                  Capítulos Disponíveis
                </h2>
                <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-850">
                  {manga.chapters.length} cap.
                </span>
              </div>

              {/* List table */}
              <div className="overflow-hidden rounded-xl border border-zinc-900">
                <div className="divide-y divide-zinc-900/70">
                  {manga.chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      onClick={() => onSelectChapter(chapter)}
                      className="flex items-center justify-between px-4 py-3.5 hover:bg-zinc-900/50 text-zinc-300 hover:text-white transition-all duration-150 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-red-500 transition-colors shrink-0"></div>
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-red-400 transition-colors">
                            {chapter.number}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-bold truncate max-w-xs sm:max-w-md">
                            {chapter.title}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-500">
                          <Clock className="w-3 h-3" />
                          <span>{chapter.releaseDate}</span>
                        </div>
                        <span className="px-3 py-1 text-[10px] font-extrabold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
                          LER AGORA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Embedded Comments System */}
            <CommentSection 
              mangaId={manga.id} 
              currentUser={currentUser} 
              onOpenLogin={onOpenLogin} 
            />

          </div>

          {/* Metadata Sidebar right column (1/3 width) */}
          <div className="space-y-6">
            
            {/* Technical Information Sheet */}
            <div className="bg-zinc-900/60 border border-zinc-900 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Ficha Técnica
              </h3>
              
              <div className="divide-y divide-zinc-900 text-xs">
                
                <div className="py-2.5 flex justify-between gap-2 items-center">
                  <span className="text-zinc-500 font-bold">Autor(es)</span>
                  <span className="font-extrabold text-zinc-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-red-500" />
                    {manga.author}
                  </span>
                </div>

                <div className="py-2.5 flex justify-between gap-2 items-center">
                  <span className="text-zinc-500 font-bold">Artista(s)</span>
                  <span className="font-extrabold text-zinc-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-red-500" />
                    {manga.artist}
                  </span>
                </div>

                <div className="py-2.5 flex justify-between gap-2 items-center">
                  <span className="text-zinc-500 font-bold">Ano de Lançamento</span>
                  <span className="font-extrabold text-zinc-300">{manga.releaseYear}</span>
                </div>

                <div className="py-2.5 flex justify-between gap-2 items-center">
                  <span className="text-zinc-500 font-bold">Tipo de Publicação</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold">{manga.type}</span>
                </div>

                <div className="py-2.5 flex justify-between gap-2 items-center">
                  <span className="text-zinc-500 font-bold">Distribuidora Scan</span>
                  <span className="font-extrabold text-red-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    Kokoro Scans
                  </span>
                </div>

                <div className="py-2.5 flex justify-between gap-2 items-center">
                  <span className="text-zinc-500 font-bold">Qualidade</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Ultra-HD Scan
                  </span>
                </div>
              </div>
            </div>

            {/* Genres Tag Cloud */}
            <div className="bg-zinc-900/60 border border-zinc-900 p-5 rounded-2xl space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                Gêneros e Categorias
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {manga.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-900 text-[10px] font-bold tracking-wider cursor-pointer transition-colors"
                  >
                    #{genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruitment widget banner */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-red-950/20 p-5 space-y-3 shadow-lg relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-[20deg] select-none">
                <Heart className="w-24 h-24 text-red-500 fill-red-500" />
              </div>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-black tracking-widest">
                RECRUTAMENTO
              </span>
              <h4 className="text-sm font-black text-white">Quer ajudar na Tradução?</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Estamos sempre precisando de tradutores (coreano/japonês/inglês) e editores de imagens! Junte-se ao nosso servidor do Discord.
              </p>
              <button 
                onClick={() => window.open("https://discord.com/invite/xTHuFMCSbt", "_blank", "noopener,noreferrer")}
                className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-red-600 hover:text-white border border-zinc-850 text-red-400 text-xs font-bold transition-all cursor-pointer"
              >
                Entrar no Discord
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
