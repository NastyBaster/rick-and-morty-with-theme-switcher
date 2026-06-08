import { useState } from "react";
import FilterBTN from "../FilterBTN";
import { ChevronDown } from "lucide-react";

interface SpeciesProps {
  updateSpecies: (species: string) => void;
  updatePageNumber: (page: number) => void;
  currentSpecies: string;
}

export default function Species({
  updateSpecies,
  updatePageNumber,
  currentSpecies,
}: SpeciesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const speciesList = [
    "Human",
    "Alien",
    "Humanoid",
    "Poopybutthole",
    "Mythological",
    "Unknown",
    "Animal",
    "Disease",
    "Robot",
    "Cronenberg",
    "Planet",
  ];

  return (
    <div className="theme-accordion rounded-xl overflow-hidden backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-bold text-theme-secondary bg-theme-hover transition-colors"
      >
        <span>Species</span>
        <ChevronDown
          className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="theme-accordion-content p-4 flex flex-wrap gap-2.5">
          {speciesList.map((item, index) => (
            <FilterBTN
              key={index}
              index={index}
              name="species"
              task={updateSpecies}
              updatePageNumber={updatePageNumber}
              input={item}
              isActive={currentSpecies === item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
