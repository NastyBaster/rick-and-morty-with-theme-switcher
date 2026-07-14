import { useState, useEffect } from "react";
import Search from "../components/Search";
import Card from "../components/Card";
import Filter from "../components/Filter";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCharacters, type CharacterResponse } from "../api/characters";
import { isAbortError, RateLimitError } from "../api/errors";
import { getRateLimitCooldownMs } from "../api/rateLimiter";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

const ReactPaginateComponent =
  (ReactPaginate as unknown as { default: typeof ReactPaginate }).default ||
  ReactPaginate;

export default function Home() {
  const [pageNumber, updatePageNumber] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebouncedValue(search, 400);
  const [status, updateStatus] = useState<string>("");
  const [gender, updateGender] = useState<string>("");
  const [species, updateSpecies] = useState<string>("");
  const [fetchedData, updateFetchedData] = useState<CharacterResponse>({
    info: {},
    results: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { info, results } = fetchedData;

  useEffect(() => {
    const controller = new AbortController();

    async function loadCharacters() {
      setLoading(true);
      setError(null);

      try {
        const data = await getCharacters(
          {
            page: pageNumber,
            name: debouncedSearch.trim(),
            status,
            gender,
            species,
          },
          controller.signal,
        );

        updateFetchedData(
          data.error ? { info: { count: 0, pages: 0 }, results: [] } : data,
        );
      } catch (err) {
        if (isAbortError(err)) return;

        if (err instanceof RateLimitError) {
          const seconds = Math.ceil(getRateLimitCooldownMs() / 1000);
          setError(
            `The public API is rate-limiting requests. Please pause for about ${seconds || 1} seconds, then change a filter or page to try again.`,
          );
          return;
        }

        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch characters",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCharacters();
    return () => controller.abort();
  }, [pageNumber, debouncedSearch, status, gender, species]);

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const updateDimensions = () => setWidth(window.innerWidth);
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const pageChange = (data: { selected: number }) => {
    if (loading) return;
    updatePageNumber(data.selected + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-theme mb-2">
          Multiverse{" "}
          <span className="bg-linear-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Characters
          </span>
        </h1>
        <p className="text-theme-muted text-sm sm:text-base max-w-md mx-auto">
          Explore all characters from the Rick and Morty universe, filter by
          status, species, and gender.
        </p>
      </div>

      <Search setSearch={setSearch} updatePageNumber={updatePageNumber} />

      {error && (
        <div className="mb-6 max-w-2xl mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-28 theme-panel p-5 rounded-2xl">
            <Filter
              updateStatus={updateStatus}
              updateGender={updateGender}
              updateSpecies={updateSpecies}
              updatePageNumber={updatePageNumber}
              status={status}
              gender={gender}
              species={species}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-4 py-12 text-theme-muted">
              <div className="loader" aria-hidden="true" />
              <span className="text-sm font-semibold tracking-wide uppercase text-theme-faint">
                Loading characters…
              </span>
            </div>
          )}

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${loading ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Card page="/" results={results ?? []} />
          </div>

          {info?.pages && info.pages > 1 && (
            <ReactPaginateComponent
              className={`pagination-container ${loading ? "pagination-disabled" : ""}`}
              nextLabel={<ChevronRight className="w-5 h-5" />}
              previousLabel={<ChevronLeft className="w-5 h-5" />}
              forcePage={pageNumber === 1 ? 0 : pageNumber - 1}
              marginPagesDisplayed={width < 576 ? 1 : 2}
              pageRangeDisplayed={width < 576 ? 1 : 2}
              pageCount={info?.pages || 0}
              onPageChange={pageChange}
              disableInitialCallback
              pageClassName="pagination-page"
              pageLinkClassName="w-full h-full flex items-center justify-center"
              previousClassName="pagination-nav"
              nextClassName="pagination-nav"
              activeClassName="pagination-active"
              disabledClassName="pagination-disabled"
              breakClassName="pagination-break"
              breakLabel="..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
