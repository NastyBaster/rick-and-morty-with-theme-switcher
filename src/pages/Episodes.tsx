import { useEffect, useState } from "react";
import Card from "../components/Card";
import InputGroup from "../components/category/InputGroup";
import { Tv, Calendar } from "lucide-react";
import { fetchApi } from "../api/client";

interface EpisodeInfo {
  air_date: string;
  episode: string;
  name: string;
  characters: string[];
}

export default function Episodes() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<EpisodeInfo>({
    air_date: "",
    episode: "",
    name: "",
    characters: [],
  });
  const [id, setID] = useState<number>(1);

  const { air_date, name } = info;

  useEffect(() => {
    const controller = new AbortController();

    (async function () {
      setLoading(true);

      try {
        const data = await fetchApi<EpisodeInfo & { characters: string[] }>(
          `/episode/${id}`,
          { signal: controller.signal },
        );
        setInfo(data);

        const charData = await Promise.all(
          data.characters.map((url: string) =>
            fetchApi(url, { signal: controller.signal }),
          ),
        );
        setResults(charData);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Error fetching episode details:", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Episode Header Info */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          <Tv className="w-3.5 h-3.5" /> Episode Portal
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-theme tracking-tight mb-3">
          Episode Name:{" "}
          <span className="bg-linear-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            {name === "" ? "Unknown" : name}
          </span>
        </h1>
        <p className="text-theme-muted text-sm sm:text-base flex items-center justify-center gap-2 max-w-md mx-auto">
          <Calendar className="w-4 h-4 text-theme-faint" />
          Air Date: {air_date === "" ? "Unknown" : air_date}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Selector */}
        <div className="lg:col-span-1">
          <div className="theme-panel p-5 rounded-2xl sticky top-28 space-y-4">
            <h2 className="text-lg font-bold text-theme-secondary">
              Pick Episode
            </h2>
            <InputGroup name="Episode" changeID={setID} total={51} />
          </div>
        </div>

        {/* Right Column: Cards */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-theme bg-theme-surface/60 p-8 text-theme-muted">
              <div className="loader scale-75" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-theme-faint">
                Loading episode cards…
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card page="/episodes/" results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
