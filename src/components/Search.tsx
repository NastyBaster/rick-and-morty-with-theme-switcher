import React from "react";
import { Search as SearchIcon } from "lucide-react";

interface SearchProps {
  setSearch: (search: string) => void;
  updatePageNumber: (page: number) => void;
}

export default function Search({ setSearch, updatePageNumber }: SearchProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto mb-10 px-4"
    >
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-theme-muted" />
        </div>
        <input
          onChange={(e) => {
            updatePageNumber(1);
            setSearch(e.target.value);
          }}
          type="text"
          placeholder="Search for characters..."
          className="theme-input block w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-inner"
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl border border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300"
      >
        Search
      </button>
    </form>
  );
}
