import { useEffect, useState } from "react";
import Card from "../components/Card";
import InputGroup from "../components/category/InputGroup";
import { MapPin, Globe, Compass } from "lucide-react";
import { fetchApi } from "../api/client";

interface LocationInfo {
  name: string;
  type: string;
  dimension: string;
  residents: string[];
}

export default function Location() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationOptions, setLocationOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [info, setInfo] = useState<LocationInfo>({
    name: "",
    type: "",
    dimension: "",
    residents: [],
  });
  const [number, setNumber] = useState<number>(1);

  const { name, type, dimension } = info;

  useEffect(() => {
    let isMounted = true;

    (async function () {
      try {
        const allLocations = [];
        let page = 1;

        while (true) {
          const data = await fetchApi<{
            info?: { next?: string | null };
            results?: Array<{ id: number; name: string }>;
          }>(`/location?page=${page}`);

          allLocations.push(...(data.results ?? []));
          if (!data.info?.next) break;
          page += 1;
        }

        if (!isMounted) return;

        setLocationOptions(
          allLocations.map((item) => ({
            value: item.id,
            label: item.name,
          })),
        );
      } catch (err) {
        console.error("Error fetching location list:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async function () {
      setLoading(true);

      try {
        const data = await fetchApi<LocationInfo>(`/location/${number}`, {
          signal: controller.signal,
        });
        setInfo(data);

        const residentData = await Promise.all(
          (data.residents || []).map((url: string) =>
            fetchApi(url, { signal: controller.signal }),
          ),
        );
        setResults(residentData);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Error fetching location details:", err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [number]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Location Header Info */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          <MapPin className="w-3.5 h-3.5" /> Space-Time Portal
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-theme tracking-tight mb-4">
          Location:{" "}
          <span className="bg-linear-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            {name === "" ? "Unknown" : name}
          </span>
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-theme-muted text-sm sm:text-base max-w-xl mx-auto">
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-theme-faint" />
            <strong className="text-theme-secondary">Dimension:</strong>{" "}
            {dimension === "" ? "Unknown" : dimension}
          </span>
          <span className="hidden sm:inline text-theme-faint">|</span>
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-theme-faint" />
            <strong className="text-theme-secondary">Type:</strong>{" "}
            {type === "" ? "Unknown" : type}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Selector */}
        <div className="lg:col-span-1">
          <div className="theme-panel p-5 rounded-2xl sticky top-28 space-y-4">
            <h2 className="text-lg font-bold text-theme-secondary">
              Pick Location
            </h2>
            <InputGroup
              name="Location"
              changeID={setNumber}
              total={126}
              options={locationOptions}
            />
          </div>
        </div>

        {/* Right Column: Cards */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-theme bg-theme-surface/60 p-8 text-theme-muted">
              <div className="loader scale-75" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-theme-faint">
                Loading location cards…
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card page="/location/" results={results} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
