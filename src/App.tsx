import { useState, useEffect } from "react";
import { 
  Header 
} from "./components/Header";
import { LoginModal } from "./components/LoginModal";
import { MangaDetail } from "./components/MangaDetail";
import { MangaReader } from "./components/MangaReader";
import { FirebaseRulesGuide } from "./components/FirebaseRulesGuide";
import { ProfileModal } from "./components/ProfileModal";
import { MOCK_MANGAS, Manga, MangaChapter } from "./data/mangas";
import { DBService } from "./firebase";
import { 
  Bookmark, Star, Eye, BookOpen, Sparkles, 
  ChevronRight, Heart, X, Flame, Filter, RefreshCw
} from "lucide-react";

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  // Navigation states
  const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<MangaChapter | null>(null);

  // UI state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFavs, setLoadingFavs] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  // Catalog filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [selectedType, setSelectedType] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");

  // Track Auth Changes
  useEffect(() => {
    const unsubscribe = DBService.onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync Favorites when User changes
  useEffect(() => {
    const fetchFavs = async () => {
      if (currentUser) {
        setLoadingFavs(true);
        try {
          const list = await DBService.getFavorites(currentUser.uid);
          setFavorites(list);
        } catch (e) {
          console.error("Error fetching favorites", e);
        } finally {
          setLoadingFavs(false);
        }
      } else {
        setFavorites([]);
      }
    };
    fetchFavs();
  }, [currentUser]);

  useEffect(() => {
    const loadViews = async () => {
      const entries = await Promise.all(
        MOCK_MANGAS.map(async (manga) => [manga.id, await DBService.getMangaViews(manga.id)] as const)
      );
      setViewCounts(Object.fromEntries(entries));
    };
    loadViews();
  }, []);

  // Handle Favorites toggle
  const handleToggleFavorite = async (mangaId: string) => {
    if (!currentUser) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const updated = await DBService.toggleFavorite(currentUser.uid, mangaId);
      setFavorites(updated);
    } catch (e) {
      console.error("Error toggling favorite", e);
    }
  };

  const handleLogout = async () => {
    await DBService.signOutUser();
    setCurrentUser(null);
    setIsFavoritesOpen(false);
  };

  // Filter Catalog logic
  const filteredMangas = MOCK_MANGAS.filter((manga) => {
    const matchesSearch = 
      manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manga.alternativeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manga.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
      manga.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = 
      selectedGenre === "Todos" || manga.genres.includes(selectedGenre);

    const matchesType = 
      selectedType === "Todos" || manga.type === selectedType;

    const matchesStatus = 
      selectedStatus === "Todos" || manga.status === selectedStatus;

    return matchesSearch && matchesGenre && matchesType && matchesStatus;
  });

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return String(count);
  };

  const withViews = (manga: Manga): Manga => ({
    ...manga,
    views: formatViews(viewCounts[manga.id] || Number(manga.views) || 0)
  });

  const openManga = async (manga: Manga) => {
    const nextViews = await DBService.incrementMangaViews(manga.id);
    setViewCounts((prev) => ({ ...prev, [manga.id]: nextViews }));
    setSelectedManga(withViews({ ...manga, views: formatViews(nextViews) }));
    setSelectedChapter(null);
    window.history.pushState(null, "", `/manga/${manga.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featuredManga = MOCK_MANGAS[0];
  const ALL_GENRES = ["Todos", ...Array.from(new Set(MOCK_MANGAS.flatMap((manga) => manga.genres)))];

  const navigateHome = () => {
    setSelectedManga(null);
    setSelectedChapter(null);
    window.history.pushState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open a specific chapter in the reader
  const handleOpenChapter = async (mangaObj: Manga, chapterObj: MangaChapter) => {
    const nextViews = await DBService.incrementMangaViews(mangaObj.id);
    setViewCounts((prev) => ({ ...prev, [mangaObj.id]: nextViews }));
    setSelectedManga({ ...mangaObj, views: formatViews(nextViews) });
    setSelectedChapter(chapterObj);
    setIsFavoritesOpen(false);
    window.history.pushState(null, "", `/manga/${mangaObj.id}/capitulo/${chapterObj.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const syncRoute = () => {
      const [, section, mangaId, subSection, chapterId] = window.location.pathname.split("/");
      if (section !== "manga" || !mangaId) {
        setSelectedManga(null);
        setSelectedChapter(null);
        return;
      }

      const manga = MOCK_MANGAS.find((item) => item.id === mangaId);
      if (!manga) {
        setSelectedManga(null);
        setSelectedChapter(null);
        return;
      }

      setSelectedManga(withViews(manga));
      if (subSection === "capitulo" && chapterId) {
        setSelectedChapter(manga.chapters.find((chapter) => chapter.id === chapterId) || null);
      } else {
        setSelectedChapter(null);
      }
    };

    syncRoute();
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, [viewCounts]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* HEADER */}
      <Header
        currentUser={currentUser}
        onHome={navigateHome}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* CORE PAGES SWITCHER */}
      {selectedChapter && selectedManga ? (
        
        /* 1. READER VIEW MODE */
        <MangaReader
          manga={selectedManga}
          chapter={selectedChapter}
          onBackToManga={() => {
            setSelectedChapter(null);
            window.history.pushState(null, "", `/manga/${selectedManga.id}`);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSelectChapter={(chapterId) => {
            const nextCh = selectedManga.chapters.find((c) => c.id === chapterId);
            if (nextCh) {
              setSelectedChapter(nextCh);
              window.history.pushState(null, "", `/manga/${selectedManga.id}/capitulo/${nextCh.id}`);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />

      ) : selectedManga ? (
        
        /* 2. MANGA DETAIL VIEW MODE */
        <MangaDetail
          manga={withViews(selectedManga)}
          isFavorited={favorites.includes(selectedManga.id)}
          onToggleFavorite={() => handleToggleFavorite(selectedManga.id)}
          onBack={navigateHome}
          onSelectChapter={(chapter) => handleOpenChapter(selectedManga, chapter)}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginOpen(true)}
        />

      ) : (
        
        /* 3. HOME & CATALOG VIEW MODE */
        <main className="flex-1">
          
          {/* Large Hero Banner */}
          <div className="relative h-[380px] sm:h-[480px] bg-zinc-900 overflow-hidden border-b border-zinc-900/50">
            {/* Background Image */}
            <img
              src={featuredManga.bannerUrl}
              alt={featuredManga.title}
              className="absolute inset-0 w-full h-full object-cover filter brightness-30 contrast-105"
            />
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
            <div className="absolute inset-y-0 left-0 w-full md:w-2/3 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>

            {/* Content box over hero */}
            <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 space-y-4">
              
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded bg-red-600 text-white shadow shadow-red-900/40 animate-bounce">
                  <Flame className="w-3.5 h-3.5 fill-white" />
                  DESTAQUE DA SEMANA
                </span>
                <span className="text-[10px] sm:text-xs font-bold px-2 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {featuredManga.type}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight max-w-2xl drop-shadow">
                {featuredManga.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed line-clamp-3 drop-shadow">
                {featuredManga.synopsis}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  {featuredManga.rating}
                </span>
                <span>•</span>
                <span>{featuredManga.author}</span>
                <span>•</span>
                <span>{formatViews(viewCounts[featuredManga.id] || 0)} views</span>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={() => {
                    handleOpenChapter(featuredManga, featuredManga.chapters[0]);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-extrabold text-white shadow-xl shadow-red-950/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <BookOpen className="w-4.5 h-4.5" />
                  <span>Ler Capítulo 1</span>
                </button>
                
                <button
                  onClick={() => handleToggleFavorite(featuredManga.id)}
                  className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    favorites.includes(featuredManga.id)
                      ? "bg-rose-600/10 border-rose-600 text-rose-500"
                      : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(featuredManga.id) ? "fill-current" : ""}`} />
                </button>
              </div>

            </div>
          </div>

          {/* CATALOG SECTIONS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
            
            {/* Row Title */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
                  Explorar Catálogo de Scans
                </h3>
                <p className="text-xs text-zinc-400">Traduções exclusivas em alta resolução para leitores exigentes</p>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-850">
                <Filter className="w-3.5 h-3.5" />
                <span>{filteredMangas.length} Encontrados</span>
              </div>
            </div>

            {/* Genres Tabs Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {ALL_GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide whitespace-nowrap transition-all cursor-pointer ${
                    selectedGenre === genre
                      ? "bg-red-600 text-white shadow-md shadow-red-950/30"
                      : "bg-zinc-900/80 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-850"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Auxiliary Filters Selector Bar (Type, Status, Clear) */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-900">
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Type Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Formato:</span>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-bold outline-none"
                  >
                    <option value="Todos">Todos Formatos</option>
                    <option value="Mangá">Mangá (Japonês)</option>
                    <option value="Manhwa">Manhwa (Coreano)</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 font-bold outline-none"
                  >
                    <option value="Todos">Todos Status</option>
                    <option value="Ativo">Ativo (Lançamento)</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              {/* Clear filters trigger */}
              {(selectedGenre !== "Todos" || selectedType !== "Todos" || selectedStatus !== "Todos" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedGenre("Todos");
                    setSelectedType("Todos");
                    setSelectedStatus("Todos");
                    setSearchQuery("");
                  }}
                  className="px-3 py-1.5 rounded bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-red-500 text-xs font-bold transition-all cursor-pointer"
                >
                  Resetar Filtros
                </button>
              )}
            </div>

            {/* MANGA CARDS GRID */}
            {filteredMangas.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 space-y-3 bg-zinc-900/10 border border-zinc-900/50 rounded-2xl border-dashed">
                <RefreshCw className="w-10 h-10 text-zinc-850 mx-auto animate-spin" />
                <div>
                  <h4 className="font-bold text-zinc-300">Nenhum mangá correspondente</h4>
                  <p className="text-xs max-w-xs mx-auto">Tente reajustar seus termos de pesquisa ou resetar os filtros acima.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {filteredMangas.map((manga) => {
                  const isFav = favorites.includes(manga.id);
                  const latestChapter = manga.chapters[0];

                  return (
                    <div 
                      key={manga.id}
                      className="group flex flex-col bg-zinc-900/20 border border-zinc-900 rounded-2xl overflow-hidden hover:border-red-500/30 hover:bg-zinc-900/40 hover:shadow-xl hover:shadow-red-950/5 transition-all duration-300"
                    >
                      {/* Image Thumbnail wrapper */}
                      <div className="relative aspect-[3/4.2] overflow-hidden bg-zinc-950 cursor-pointer" onClick={() => openManga(manga)}>
                        <img
                          src={manga.coverUrl}
                          alt={manga.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                        />

                        {/* Top float indicators */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[9px] shadow select-none">
                            {manga.type}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(manga.id);
                            }}
                            className={`p-1.5 rounded-full backdrop-blur-md bg-black/60 border border-zinc-800/50 hover:bg-black/80 transition-all cursor-pointer ${
                              isFav ? "text-red-500 scale-110" : "text-zinc-300 hover:text-red-500"
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 stroke-red-500" : ""}`} />
                          </button>
                        </div>

                        {/* Bottom Floating Stats */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 to-transparent p-3 pt-8 flex items-center justify-between text-[10px] font-bold text-zinc-300">
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {manga.rating}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3.5 h-3.5 text-red-500" />
                            {formatViews(viewCounts[manga.id] || Number(manga.views) || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Info & Chapters Shortcut */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3.5">
                        
                        <div className="space-y-1">
                          <h4 
                            onClick={() => openManga(manga)}
                            className="text-xs sm:text-sm font-extrabold text-zinc-100 hover:text-red-400 leading-snug cursor-pointer transition-colors line-clamp-1"
                          >
                            {manga.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 font-bold truncate">Por {manga.author}</p>
                        </div>

                        {/* Latest Chapter Quick Link */}
                        {latestChapter && (
                          <div className="space-y-1.5 pt-1.5 border-t border-zinc-900/60">
                            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Última Atualização</p>
                            <button
                              onClick={() => handleOpenChapter(manga, latestChapter)}
                              className="w-full text-left px-2.5 py-1.5 bg-zinc-950 border border-zinc-850 hover:border-red-500/20 hover:bg-zinc-900 rounded-lg text-[10px] sm:text-xs font-bold text-zinc-300 hover:text-white flex items-center justify-between transition-all cursor-pointer group/btn"
                            >
                              <span className="truncate group-hover/btn:text-red-400">{latestChapter.number}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover/btn:text-red-500 transition-colors" />
                            </button>
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-white fill-white animate-pulse" />
              </div>
              <span className="text-base font-black text-white tracking-widest uppercase">
                KOKORO<span className="text-red-500">SCANS</span>
              </span>
            </div>
            <p className="text-[11px] leading-relaxed max-w-xs mx-auto md:mx-0">
              O portal número um de traduções de mangás de alta fidelidade para fãs de língua portuguesa. Todo o material é traduzido voluntariamente. Apoie os autores oficiais comprando o material original!
            </p>
          </div>

          <div className="flex flex-col items-center justify-center md:items-start gap-2">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-widest">Acesso Rápido</h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <button 
                onClick={() => { setSearchQuery(""); navigateHome(); }}
                className="hover:text-red-500 font-semibold cursor-pointer"
              >
                Início
              </button>
              <span>•</span>
              <button 
                onClick={() => { setSelectedGenre("Ação"); navigateHome(); }}
                className="hover:text-red-500 font-semibold cursor-pointer"
              >
                Ação
              </button>
              <span>•</span>
              <button 
                onClick={() => { setSelectedGenre("Fantasia"); navigateHome(); }}
                className="hover:text-red-500 font-semibold cursor-pointer"
              >
                Fantasia
              </button>
              <span>•</span>
              <a
                href="https://discord.com/invite/xTHuFMCSbt"
                target="_blank"
                rel="noreferrer"
                className="hover:text-red-500 font-semibold cursor-pointer"
              >
                Discord
              </a>
            </div>
          </div>

          <div className="text-center md:text-right space-y-2">
            <p className="font-extrabold text-white uppercase tracking-widest">Kokoro Web App v2.0</p>
            <p className="text-[9px] text-zinc-600">
              &copy; {new Date().getFullYear()} Kokoro Scans. Nenhum direito reservado (Projeto Fan-made).
            </p>
          </div>

          <div className="md:col-span-3 border-t border-zinc-900 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] leading-relaxed">
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-4">
              <h5 className="font-black text-zinc-300 uppercase tracking-widest mb-2">Aviso DMCA</h5>
              <p>
                A Kokoro Scans atua como comunidade fan-made. Caso voce seja titular de direitos autorais e deseje solicitar remocao de algum conteudo, entre em contato pelo servidor do Discord com as informacoes de autoria e links correspondentes.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-4">
              <h5 className="font-black text-zinc-300 uppercase tracking-widest mb-2">Politica de Uso</h5>
              <p>
                Use o site apenas para leitura pessoal. E proibido republicar, vender, automatizar downloads ou usar os comentarios para spam, ataques, assedio ou conteudo ilegal. Comentarios podem ser moderados conforme necessario.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* MY LIBRARY DRAWER (FAVORITES SLIDE-OVER) */}
      {isFavoritesOpen && currentUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsFavoritesOpen(false)}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          ></div>

          {/* Sidebar */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-zinc-950 border-l border-zinc-850 shadow-2xl flex flex-col h-full animate-slide-left">
              
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-900 bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-red-500 fill-red-500" />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Minha Biblioteca</h3>
                    <p className="text-[10px] text-zinc-400">Seus mangás salvos ({favorites.length})</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFavoritesOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingFavs ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 bg-zinc-900 rounded-xl"></div>
                    ))}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500 space-y-3">
                    <Heart className="w-8 h-8 text-zinc-800 mx-auto stroke-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-400">Sua biblioteca está vazia</p>
                      <p className="text-[10px] max-w-xs mx-auto">Favorite mangas clicando no botão do coração nos cards ou na página de detalhes.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {MOCK_MANGAS.filter((m) => favorites.includes(m.id)).map((manga) => {
                      const latestChapter = manga.chapters[0];
                      return (
                        <div 
                          key={manga.id}
                          className="group flex gap-3 p-2 rounded-xl bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-900/60 hover:border-red-500/20 transition-all duration-150"
                        >
                          <img
                            src={manga.coverUrl}
                            alt={manga.title}
                            className="w-12 h-16 rounded object-cover cursor-pointer"
                            onClick={() => {
                              openManga(manga);
                              setIsFavoritesOpen(false);
                            }}
                          />
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 
                                onClick={() => {
                                  openManga(manga);
                                  setIsFavoritesOpen(false);
                                }}
                                className="text-xs font-bold text-zinc-200 group-hover:text-red-400 cursor-pointer truncate"
                              >
                                {manga.title}
                              </h4>
                              <p className="text-[10px] text-zinc-500">Último: {latestChapter?.number || "Sem capítulos"}</p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] pt-1">
                              <button
                                onClick={() => {
                                  if (latestChapter) {
                                    handleOpenChapter(manga, latestChapter);
                                  }
                                }}
                                className="text-red-500 font-black hover:underline cursor-pointer"
                              >
                                RETOMAR LEITURA →
                              </button>
                              
                              <button
                                onClick={() => handleToggleFavorite(manga.id)}
                                className="text-zinc-600 hover:text-red-500 transition-colors cursor-pointer"
                                title="Remover dos favoritos"
                              >
                                Remover
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-zinc-900 bg-zinc-900/20 text-center text-[10px] text-zinc-500">
                Sincronizado automaticamente com o {currentUser?.uid?.startsWith("mock_") ? "LocalStorage Sandbox" : "Firebase Cloud DB"}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
        />
      )}

      {isProfileOpen && currentUser && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onProfileUpdated={(user) => setCurrentUser(user)}
        />
      )}

      {/* FIREBASE SECURITY RULES GUIDE MODAL */}
      {isRulesOpen && (
        <FirebaseRulesGuide
          onClose={() => setIsRulesOpen(false)}
        />
      )}

    </div>
  );
}
