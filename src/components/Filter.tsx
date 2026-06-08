import Status from "./category/Status";
import Species from "./category/Species";
import Gender from "./category/Gender";
import { Trash2 } from "lucide-react";

interface FilterProps {
  updateStatus: (status: string) => void;
  updateGender: (gender: string) => void;
  updateSpecies: (species: string) => void;
  updatePageNumber: (page: number) => void;
  status: string;
  gender: string;
  species: string;
}

export default function Filter({
  updateStatus,
  updateGender,
  updateSpecies,
  updatePageNumber,
  status,
  gender,
  species,
}: FilterProps) {
  const clear = () => {
    updateStatus("");
    updateGender("");
    updateSpecies("");
    updatePageNumber(1);
  };

  const hasActiveFilters = status !== "" || gender !== "" || species !== "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-theme tracking-tight">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20 hover:border-rose-500/30 px-3 py-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Status
          updateStatus={updateStatus}
          updatePageNumber={updatePageNumber}
          currentStatus={status}
        />
        <Species
          updateSpecies={updateSpecies}
          updatePageNumber={updatePageNumber}
          currentSpecies={species}
        />
        <Gender
          updateGender={updateGender}
          updatePageNumber={updatePageNumber}
          currentGender={gender}
        />
      </div>
    </div>
  );
}
