import React, { useState } from "react";
import { Search, Heart, User, LogOut, BookOpen, Settings, Crown } from "lucide-react";

interface HeaderProps {
  currentUser: any | null;
  onHome: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onHome,
  onOpenLogin,
  onLogout,
  onOpenProfile,
  searchQuery,
  setSearchQuery,
  onOpenFavorites,
  favoritesCount
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isOwner = currentUser?.email?.toLowerCase() === "konozuba1k@gmail.com";

  return (
    <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 text-white shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => { setSearchQuery(""); onHome(); }}>
            <img
              src="https://i.8upload.com/image/64f36817a74d8291/155-sem-t-tulo-20260730170652.png"
              alt="Kokoro Scans"
              className="w-10 h-10 rounded-xl object-cover border border-red-500/30 shadow-md shadow-red-900/30"
            />
            <div>
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-zinc-100 to-red-400 bg-clip-text text-transparent">
                KOKORO<span className="text-red-500 font-extrabold">SCANS</span>
              </span>
            </div>
          </div>

          {/* Search Bar - hidden on tiny mobile, visible on sm and up */}
          <div className="hidden md:flex items-center flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar mangás, manhwas ou gêneros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-zinc-800 rounded-full bg-zinc-900/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300 text-xs"
              >
                limpar
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Bookmark Library Toggle */}
            {currentUser && (
              <button
                onClick={onOpenFavorites}
                className="relative p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-500 hover:bg-zinc-800 transition-all"
                title="Minha Biblioteca"
              >
                <BookOpen className="w-4.5 h-4.5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-zinc-950 animate-bounce">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            {/* Auth section */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all focus:outline-none cursor-pointer"
                >
                  <img
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.uid}`}
                    alt={currentUser.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-700 bg-zinc-850"
                  />
                  <span className="text-xs font-bold text-zinc-200 max-w-[80px] truncate hidden sm:inline">
                    {currentUser.displayName}
                  </span>
                  {isOwner && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 py-1 shadow-2xl z-20 text-sm">
                      <div className="px-4 py-2 border-b border-zinc-800">
                        <p className="text-xs text-zinc-400">Logado como</p>
                        <p className="font-bold text-zinc-200 truncate text-xs flex items-center gap-1">
                          {currentUser.displayName}
                          {isOwner && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </p>
                        <p className="text-[10px] text-zinc-500 truncate">{currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenFavorites();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-red-500" />
                        Minha Biblioteca
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-zinc-400" />
                        Editar Perfil
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-zinc-800 text-red-400 hover:text-red-300 flex items-center gap-2 border-t border-zinc-850 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-950/40 hover:shadow-red-950/60 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile search bar (only visible under md) */}
      <div className="md:hidden px-4 pb-3 border-t border-zinc-900 pt-2 bg-zinc-950">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar mangás, manhwas ou gêneros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-850 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 inset-y-0 flex items-center text-zinc-500 text-[10px] hover:text-zinc-300"
            >
              limpar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
