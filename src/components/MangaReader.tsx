import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Settings, ChevronLeft, ChevronRight, Maximize2, Minimize2, 
  ZoomIn, ZoomOut, Sparkles
} from "lucide-react";
import { Manga, MangaChapter } from "../data/mangas";

interface MangaReaderProps {
  manga: Manga;
  chapter: MangaChapter;
  onBackToManga: () => void;
  onSelectChapter: (chapterId: string) => void;
}

export const MangaReader: React.FC<MangaReaderProps> = ({
  manga,
  chapter,
  onBackToManga,
  onSelectChapter
}) => {
  // Customizable reader state
  const [theme, setTheme] = useState<"dark" | "black" | "sepia" | "light">("dark");
  const [layout, setLayout] = useState<"vertical" | "ltr" | "rtl">("vertical");
  const [panelWidth, setPanelWidth] = useState<number>(80); // percentage 0 - 100
  const [gapSize, setGapSize] = useState<number>(12); // px 0 - 32
  const [zoom, setZoom] = useState<number>(100); // percentage 80 - 150
  const [imageFit, setImageFit] = useState<"contain" | "cover" | "fill">("contain");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [pageRadius, setPageRadius] = useState<number>(0);
  const [showPageShadow, setShowPageShadow] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  
  const topRef = useRef<HTMLDivElement>(null);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Sync scroll positioning on chapter/page change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    setCurrentPage(1);
  }, [chapter.id]);

  // Handle LTR/RTL page changes or scroll monitoring in vertical mode
  useEffect(() => {
    if (layout === "vertical") {
      const handleScroll = () => {
        if (!readerContainerRef.current) return;
        const pageElements = readerContainerRef.current.querySelectorAll("[data-page-index]");
        let currentActive = 1;
        
        pageElements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          // If the element is occupying the upper middle of the viewport
          if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 3) {
            const index = Number(el.getAttribute("data-page-index"));
            if (index) currentActive = index;
          }
        });
        setCurrentPage(currentActive);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [layout, chapter.id]);

  // Keyboard navigation for LTR / RTL pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (layout === "vertical") return;
      if (e.key === "ArrowRight") {
        if (layout === "ltr") handleNextPage();
        else handlePrevPage(); // RTL reverse
      } else if (e.key === "ArrowLeft") {
        if (layout === "ltr") handlePrevPage();
        else handleNextPage(); // RTL reverse
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [layout, currentPage, chapter.pages.length]);

  const handleNextPage = () => {
    if (currentPage < chapter.pages.length) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Jump to next chapter
      handleNextChapter();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Jump to previous chapter
      handlePrevChapter();
    }
  };

  const handleNextChapter = () => {
    const currentIndex = manga.chapters.findIndex((c) => c.id === chapter.id);
    if (currentIndex > 0) { // Chapters are ordered desc, so index - 1 is the next chapter chronologically
      onSelectChapter(manga.chapters[currentIndex - 1].id);
    } else {
      alert("Você já está no último capítulo lançado! 🎉");
    }
  };

  const handlePrevChapter = () => {
    const currentIndex = manga.chapters.findIndex((c) => c.id === chapter.id);
    if (currentIndex < manga.chapters.length - 1) { // Chronologically previous is index + 1
      onSelectChapter(manga.chapters[currentIndex + 1].id);
    } else {
      alert("Você está no primeiro capítulo deste mangá!");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setFullscreen(false);
    }
  };

  // Color Styles based on Themes
  const getThemeClass = () => {
    switch (theme) {
      case "black": return "bg-black text-zinc-400";
      case "sepia": return "bg-[#f5ebd6] text-[#423321]";
      case "light": return "bg-white text-zinc-800";
      default: return "bg-zinc-950 text-zinc-300"; // dark
    }
  };

  const getBorderColorClass = () => {
    switch (theme) {
      case "sepia": return "border-[#e3d0bc]";
      case "light": return "border-zinc-200";
      default: return "border-zinc-850";
    }
  };

  const getHeaderClass = () => {
    switch (theme) {
      case "sepia": return "bg-[#eadcb3] text-[#4d3b24] border-b border-[#ddce9e]";
      case "light": return "bg-zinc-50 text-zinc-800 border-b border-zinc-200";
      default: return "bg-zinc-900 border-b border-zinc-800 text-zinc-200";
    }
  };

  const getInputClass = () => {
    switch (theme) {
      case "sepia": return "bg-[#e5d4ab] border-[#cbb382] text-[#4d3b24]";
      case "light": return "bg-white border-zinc-300 text-zinc-800";
      default: return "bg-zinc-950 border-zinc-800 text-zinc-200";
    }
  };

  return (
    <div ref={readerContainerRef} className={`min-h-screen transition-colors duration-200 ${getThemeClass()}`}>
      
      {/* Top Ref Anchor */}
      <div ref={topRef} />

      {/* Reader Sticky Header */}
      <div className={`sticky top-0 z-30 transition-colors duration-200 ${getHeaderClass()} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
          
          {/* Back & Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToManga}
              className="p-1.5 rounded-lg hover:bg-black/10 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
            <div className="h-5 w-[1px] bg-current opacity-20 hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black truncate max-w-[150px] sm:max-w-[220px]">
                  {manga.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold shrink-0">
                  {manga.type}
                </span>
              </div>
              <p className="text-[10px] font-bold text-red-500 tracking-wide -mt-0.5">
                {chapter.number} - {chapter.title}
              </p>
            </div>
          </div>

          {/* Quick Chapter Switcher Selector & Page progress */}
          <div className="flex items-center gap-2">
            
            {/* Prev Chapter Button */}
            <button
              onClick={handlePrevChapter}
              className="p-1 rounded hover:bg-black/10 transition-all cursor-pointer"
              title="Capítulo Anterior"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>

            {/* Selector */}
            <select
              value={chapter.id}
              onChange={(e) => onSelectChapter(e.target.value)}
              className={`text-xs font-semibold px-2 py-1.5 rounded-lg border outline-none ${getInputClass()}`}
            >
              {manga.chapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.number}
                </option>
              ))}
            </select>

            {/* Next Chapter Button */}
            <button
              onClick={handleNextChapter}
              className="p-1 rounded hover:bg-black/10 transition-all cursor-pointer"
              title="Próximo Capítulo"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Configuration Trigger & Settings */}
          <div className="flex items-center gap-2">
            
            <span className="text-xs font-mono font-bold py-1 px-2 rounded bg-black/10 shrink-0">
              Pag: {currentPage} / {chapter.pages.length}
            </span>

            {/* Toggle Panel Config */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-lg hover:bg-black/10 flex items-center gap-1.5 transition-all cursor-pointer ${showConfig ? "bg-red-500/10 text-red-500" : ""}`}
              title="Opções de Personalização do Leitor"
            >
              <Settings className="w-4.5 h-4.5" />
              <span className="text-xs font-bold hidden lg:inline">Ajustar Leitor</span>
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-black/10 transition-all cursor-pointer"
              title="Alternar Tela Cheia"
            >
              {fullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
            </button>
          </div>

        </div>

        {/* Dynamic Horizontal Progress Bar */}
        <div className="w-full h-1 bg-black/20">
          <div 
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-200"
            style={{ width: `${(currentPage / chapter.pages.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Floating Personalizer Panel Drawer */}
      {showConfig && (
        <div className={`border-b ${getBorderColorClass()} py-4 px-4 bg-zinc-900/95 text-zinc-200 backdrop-blur-md transition-colors duration-200 shadow-xl animate-slide-down`}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 text-xs font-bold">
            
            {/* Theme Selector */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                🎨 Cor do Tema do Fundo
              </span>
              <div className="grid grid-cols-4 gap-1">
                {(["dark", "black", "sepia", "light"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`py-1.5 px-1 text-[10px] uppercase font-bold rounded-lg border text-center cursor-pointer transition-all ${
                      theme === t 
                        ? "bg-red-500 border-red-500 text-white shadow" 
                        : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {t === "dark" ? "Escuro" : t === "black" ? "Breu" : t === "sepia" ? "Papiro" : "Claro"}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Direction */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                📖 Direção de Leitura
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(["vertical", "ltr", "rtl"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLayout(l);
                      setCurrentPage(1);
                    }}
                    className={`py-1.5 px-1 text-[9px] uppercase font-extrabold rounded-lg border text-center cursor-pointer transition-all ${
                      layout === l 
                        ? "bg-red-500 border-red-500 text-white shadow" 
                        : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {l === "vertical" ? "Rolagem" : l === "ltr" ? "Esq → Dir" : "Dir → Esq"}
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Width Adjuster */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                  📏 Largura das Páginas
                </span>
                <span className="text-[10px] text-red-500">{panelWidth}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">0%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={panelWidth}
                  onChange={(e) => setPanelWidth(Number(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500">100%</span>
              </div>
            </div>

            {/* Gap Size Selector & Zoom */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">
                  ↔️ Espaçamento & Zoom
                </span>
                <span className="text-[10px] text-red-500">Gap: {gapSize}px | {zoom}%</span>
              </div>
              
              <div className="flex items-center justify-between gap-3">
                {/* Gap input */}
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="range"
                    min="0"
                    max="32"
                    step="4"
                    value={gapSize}
                    disabled={layout !== "vertical"}
                    onChange={(e) => setGapSize(Number(e.target.value))}
                    className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                  />
                </div>
                
                {/* Zoom buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Encaixe da imagem</span>
              <div className="grid grid-cols-3 gap-1">
                {(["contain", "cover", "fill"] as const).map((fit) => (
                  <button
                    key={fit}
                    onClick={() => setImageFit(fit)}
                    className={`py-1.5 px-1 text-[9px] uppercase font-extrabold rounded-lg border text-center cursor-pointer transition-all ${
                      imageFit === fit ? "bg-red-500 border-red-500 text-white" : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {fit === "contain" ? "Original" : fit === "cover" ? "Cortar" : "Esticar"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Brilho</span>
                <span className="text-[10px] text-red-500">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Contraste</span>
                <span className="text-[10px] text-red-500">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                step="5"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest">Borda e sombra</span>
                <span className="text-[10px] text-red-500">{pageRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="28"
                step="2"
                value={pageRadius}
                onChange={(e) => setPageRadius(Number(e.target.value))}
                className="w-full accent-red-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <button
                onClick={() => setShowPageShadow((value) => !value)}
                className={`w-full py-1.5 rounded-lg border text-[10px] font-black cursor-pointer ${showPageShadow ? "bg-red-500 border-red-500 text-white" : "bg-zinc-800 border-zinc-700 text-zinc-300"}`}
              >
                {showPageShadow ? "Sombra ligada" : "Sombra desligada"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* READER CONTENT AREA */}
      <div className="max-w-7xl mx-auto py-6 px-4">
        
        {/* Layout Mode 1: Vertical Continuous Strip (Webtoon Style) */}
        {layout === "vertical" && (
          <div 
            className="mx-auto flex flex-col items-center transition-all duration-300"
            style={{ 
              width: `${panelWidth}%`,
              gap: `${gapSize}px`,
              maxWidth: "1100px"
            }}
          >
            {chapter.pages.map((page, index) => (
              <div
                key={page.id}
                data-page-index={index + 1}
                className={`relative group bg-zinc-900 border ${getBorderColorClass()} overflow-hidden transition-all duration-300 ${showPageShadow ? "shadow-2xl" : "shadow-none"}`}
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center", borderRadius: `${pageRadius}px` }}
              >
                {/* Panel Image */}
                <img
                  src={page.imageUrl}
                  alt={`Página ${index + 1}`}
                  className={`w-full h-auto block transition-all duration-300 ${imageFit === "cover" ? "object-cover" : imageFit === "fill" ? "object-fill" : "object-contain"}`}
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                />

              </div>
            ))}
          </div>
        )}

        {/* Layout Mode 2 & 3: Single Page Slider (LTR or RTL Book Style) */}
        {layout !== "vertical" && (
          <div className="flex flex-col items-center">
            
            {/* The single page container */}
            <div 
              className={`relative w-full max-w-3xl aspect-[3/4] bg-zinc-900 overflow-hidden border border-zinc-800 ${showPageShadow ? "shadow-2xl" : "shadow-none"}`}
              style={{ width: `${panelWidth}%`, borderRadius: `${pageRadius}px` }}
            >
              
              {/* Left Tap Zone for navigation */}
              <div 
                onClick={layout === "ltr" ? handlePrevPage : handleNextPage}
                className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer flex items-center justify-start pl-4 group"
              >
                <div className="p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-6 h-6" />
                </div>
              </div>

              {/* Right Tap Zone for navigation */}
              <div 
                onClick={layout === "ltr" ? handleNextPage : handlePrevPage}
                className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer flex items-center justify-end pr-4 group"
              >
                <div className="p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>

              {/* Page Image */}
              <img
                src={chapter.pages[currentPage - 1]?.imageUrl}
                alt={`Página ${currentPage}`}
                className={`w-full h-full ${imageFit === "cover" ? "object-cover" : imageFit === "fill" ? "object-fill" : "object-contain"}`}
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
              />

            </div>

            {/* Manual navigation controllers below the panel */}
            <div className="flex items-center gap-6 mt-4">
              <button
                onClick={handlePrevPage}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-bold border border-zinc-800 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
              
              <span className="text-xs font-mono text-zinc-500 font-bold">
                Página {currentPage} de {chapter.pages.length}
              </span>

              <button
                onClick={handleNextPage}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-bold border border-zinc-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* END-READER CHAPTER ACTIONS CONTAINER */}
      <div className={`border-t ${getBorderColorClass()} mt-12 py-10 bg-black/40 text-center space-y-6 transition-colors duration-200`}>
        <div className="max-w-md mx-auto space-y-2 px-4">
          <h4 className="text-sm font-black text-zinc-200 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-yellow-400 animate-pulse" />
            Você concluiu este capítulo!
          </h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Parabéns! Gostou do trabalho da Kokoro Scans? Deixe sua curtida ou comente sua teoria na página do mangá!
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap px-4">
          <button
            onClick={onBackToManga}
            className="px-6 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-extrabold text-zinc-300 transition-all cursor-pointer"
          >
            Voltar para o Sumário
          </button>

          <button
            onClick={handleNextChapter}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-extrabold text-white transition-all shadow-lg shadow-red-950/20 active:scale-95 cursor-pointer"
          >
            Próximo Capítulo →
          </button>
        </div>
      </div>

    </div>
  );
};
