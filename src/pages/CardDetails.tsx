import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Heart, Compass, Globe, Info } from "lucide-react";
import { fetchApi } from "../api/client";
import ApiImage from "../components/ApiImage";

interface CharacterDetail {
  name: string;
  image: string;
  status: string;
  species: string;
  gender: string;
  location?: {
    name: string;
  };
  origin?: {
    name: string;
  };
}

export default function CardDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [fetchedData, updateFetchedData] = useState<CharacterDetail | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    (async function () {
      try {
        const data = await fetchApi<CharacterDetail>(`/character/${id}`, {
          signal: controller.signal,
        });
        updateFetchedData(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("Error fetching character details:", err);
      }
    })();

    return () => controller.abort();
  }, [id]);

  if (!fetchedData) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-theme-muted">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-lg font-semibold text-theme-secondary">Loading Character Profile...</span>
      </div>
    );
  }

  const { name, location, origin, gender, image, status, species } = fetchedData;

  // Determine status color
  let badgeColor = "bg-slate-500/20 text-slate-400 border-slate-500/30";
  let badgeDot = "bg-slate-400";
  if (status === "Alive") {
    badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    badgeDot = "bg-emerald-400";
  } else if (status === "Dead") {
    badgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/30";
    badgeDot = "bg-rose-400";
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-theme-muted hover:text-theme theme-input transition-all duration-300 mb-8 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to List
      </button>

      {/* Profile Card */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-theme-strong shadow-2xl grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 relative aspect-square md:aspect-auto" style={{ backgroundColor: "var(--card-image-bg)" }}>
          <ApiImage
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
        </div>

        {/* Profile Details Column */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badgeDot} animate-pulse`} />
                {status}
              </span>
              <span className="text-xs uppercase bg-theme-surface-muted text-theme-muted border border-theme px-2.5 py-1 rounded-full font-semibold">
                {species}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-theme tracking-tight mb-8">
              {name}
            </h1>

            {/* Profile Fields */}
            <div className="space-y-6">
              {/* Gender */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-theme-faint font-semibold uppercase tracking-wider block">Gender</span>
                  <span className="text-base text-theme-secondary font-medium capitalize">{gender}</span>
                </div>
              </div>

              {/* Species */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-theme-faint font-semibold uppercase tracking-wider block">Species</span>
                  <span className="text-base text-theme-secondary font-medium">{species}</span>
                </div>
              </div>

              {/* Last Location */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-theme-faint font-semibold uppercase tracking-wider block">Last Known Location</span>
                  <span className="text-base text-theme-secondary font-medium">{location?.name || "Unknown"}</span>
                </div>
              </div>

              {/* Origin */}
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-theme-faint font-semibold uppercase tracking-wider block">Origin Planet</span>
                  <span className="text-base text-theme-secondary font-medium">{origin?.name || "Unknown"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-theme text-theme-faint text-xs flex justify-between items-center">
            <span>Character ID: #{id}</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-rose-500 animate-pulse fill-rose-500" /> for Multiverse
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
