import { Link } from "react-router-dom";
import { MapPin, HelpCircle } from "lucide-react";
import ApiImage from "./ApiImage";

interface Character {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  gender: string;
  location: {
    name: string;
    url: string;
  };
  origin: {
    name: string;
    url: string;
  };
}

interface CardProps {
  page: string;
  results?: Character[];
}

export default function Card({ page, results }: CardProps) {
  if (!results || results.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center p-12 text-theme-muted glass-panel rounded-2xl border border-theme">
        <HelpCircle className="w-16 h-16 text-indigo-400 mb-4 animate-bounce" />
        <span className="text-xl font-semibold text-theme-secondary">No Characters Found :/</span>
        <span className="text-sm text-theme-faint mt-2">Try clearing your filters or refining your search.</span>
      </div>
    );
  }

  return (
    <>
      {results.map((char) => {
        const { id, image, name, status, location, species } = char;

        // Determine status badge color
        let statusColor = "bg-slate-500/20 text-slate-400 border-slate-500/30";
        let statusDot = "bg-slate-400";
        if (status === "Alive") {
          statusColor = "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
          statusDot = "bg-emerald-400";
        } else if (status === "Dead") {
          statusColor = "bg-rose-500/15 text-rose-400 border-rose-500/20";
          statusDot = "bg-rose-400";
        }

        return (
          <Link
            to={`${page}${id}`}
            key={id}
            className="group block relative glass-panel glass-panel-hover rounded-2xl overflow-hidden shadow-lg border border-theme transition-all duration-300"
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor} backdrop-blur-md shadow-sm`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot} animate-pulse`} />
                {status}
              </span>
            </div>

            {/* Character Image */}
            <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: "var(--card-image-bg)" }}>
              <ApiImage
                src={image}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-theme group-hover:text-indigo-400 transition-colors duration-300 line-clamp-1">
                  {name}
                </h3>
                <span className="text-xs text-theme-muted font-medium tracking-wider uppercase">
                  {species}
                </span>
              </div>

              <div className="pt-4 border-t border-theme space-y-1">
                <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
                  Last Known Location
                </span>
                <span className="text-sm text-theme-secondary flex items-center gap-1.5 font-medium line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-theme-faint flex-shrink-0" />
                  {location.name}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}
