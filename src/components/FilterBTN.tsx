

interface FilterBTNProps {
  name: string;
  index: number;
  input: string;
  task: (value: string) => void;
  updatePageNumber: (page: number) => void;
  isActive: boolean;
}

export default function FilterBTN({
  name,
  index,
  input,
  task,
  updatePageNumber,
  isActive,
}: FilterBTNProps) {
  const id = `${name}-${index}`;

  return (
    <div>
      <input
        type="radio"
        name={name}
        id={id}
        checked={isActive}
        onChange={() => {
          task(input);
          updatePageNumber(1);
        }}
        className="peer hidden"
      />
      <label
        htmlFor={id}
        className="theme-filter-btn inline-block px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer select-none
          peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-500 peer-checked:shadow-[0_0_12px_rgba(99,102,241,0.3)]"
      >
        {input}
      </label>
    </div>
  );
}
