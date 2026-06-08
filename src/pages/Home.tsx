import { useState, useEffect } from "react";
import Search from "../components/Search";
import Card from "../components/Card";
import Filter from "../components/Filter";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApi, RateLimitError } from "../api/client";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

// Fix for ReactPaginate default export issue in CJS/ESM interop
const ReactPaginateComponent =
  (ReactPaginate as unknown as { default: typeof ReactPaginate }).default ||
  ReactPaginate;

interface CharacterResponse {
  info?: {
    count?: number;
    pages?: number;
    next?: string | null;
    prev?: string | null;
  };
  // Strongly-typed character results to avoid `any`
  results?: Character[];
  error?: string;
}

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url?: string;
  created?: string;
}

function buildCharacterPath(params: {
  page: number;
  name: string;
  status: string;
  gender: string;
  species: string;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  if (params.name) searchParams.set("name", params.name);
  if (params.status) searchParams.set("status", params.status);
  if (params.gender) searchParams.set("gender", params.gender);
  if (params.species) searchParams.set("species", params.species);
  return `/character/?${searchParams.toString()}`;
}

export default function Home() {
  const [pageNumber, updatePageNumber] = useState<number>(1);
  const debouncedPageNumber = useDebouncedValue(pageNumber, 700);
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
  const [retryCount, setRetryCount] = useState(0);

  const { info, results } = fetchedData;

  useEffect(() => {
    const controller = new AbortController();

    (async function () {
      setLoading(true);
      setError(null);

      try {
        const path = buildCharacterPath({
          page: debouncedPageNumber,
          name: debouncedSearch,
          status,
          gender,
          species,
        });
        const data = await fetchApi<CharacterResponse>(path, {
          signal: controller.signal,
        });

        if (data.error) {
          updateFetchedData({ info: { count: 0, pages: 0 }, results: [] });
        } else {
          updateFetchedData(data);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;

        if (err instanceof RateLimitError) {
          setError(err.message);
          const retryTimer = setTimeout(() => {
            setRetryCount((count) => count + 1);
          }, err.retryAfterMs);
          controller.signal.addEventListener(
            "abort",
            () => clearTimeout(retryTimer),
            {
              once: true,
            },
          );
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to fetch characters";
        console.error("Error fetching data:", err);
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [
    debouncedPageNumber,
    debouncedSearch,
    status,
    gender,
    species,
    retryCount,
  ]);

  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const updateDimensions = () => setWidth(window.innerWidth);
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const pageChange = (data: { selected: number }) => {
    if (loading || pageNumber !== debouncedPageNumber) return;
    updatePageNumber(data.selected + 1);
  };

  const paginationBusy = loading || pageNumber !== debouncedPageNumber;

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
              className={`pagination-container ${paginationBusy ? "pagination-disabled" : ""}`}
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
