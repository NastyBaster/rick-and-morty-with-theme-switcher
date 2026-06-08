import { useState } from "react";
import FilterBTN from "../FilterBTN";
import { ChevronDown } from "lucide-react";

interface GenderProps {
  updateGender: (gender: string) => void;
  updatePageNumber: (page: number) => void;
  currentGender: string;
}

export default function Gender({
  updateGender,
  updatePageNumber,
  currentGender,
}: GenderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const genderList = ["female", "male", "genderless", "unknown"];

  return (
    <div className="theme-accordion rounded-xl overflow-hidden backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-bold text-theme-secondary bg-theme-hover transition-colors"
      >
        <span>Gender</span>
        <ChevronDown
          className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="theme-accordion-content p-4 flex flex-wrap gap-2.5">
          {genderList.map((item, index) => (
            <FilterBTN
              key={index}
              index={index}
              name="gender"
              task={updateGender}
              updatePageNumber={updatePageNumber}
              input={item}
              isActive={currentGender === item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
