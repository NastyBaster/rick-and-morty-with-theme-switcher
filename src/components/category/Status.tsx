import { useState } from "react";
import FilterBTN from "../FilterBTN";
import { ChevronDown } from "lucide-react";

interface StatusProps {
  updateStatus: (status: string) => void;
  updatePageNumber: (page: number) => void;
  currentStatus: string;
}

export default function Status({
  updateStatus,
  updatePageNumber,
  currentStatus,
}: StatusProps) {
  const [isOpen, setIsOpen] = useState(true);
  const statusList = ["Alive", "Dead", "Unknown"];

  return (
    <div className="theme-accordion rounded-xl overflow-hidden backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 font-bold text-theme-secondary bg-theme-hover transition-colors"
      >
        <span>Status</span>
        <ChevronDown
          className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="theme-accordion-content p-4 flex flex-wrap gap-2.5">
          {statusList.map((item, index) => (
            <FilterBTN
              key={index}
              index={index}
              name="status"
              task={updateStatus}
              updatePageNumber={updatePageNumber}
              input={item}
              isActive={currentStatus === item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
