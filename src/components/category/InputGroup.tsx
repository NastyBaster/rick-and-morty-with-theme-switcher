interface OptionItem {
  value: number;
  label: string;
}

interface InputGroupProps {
  name: string;
  changeID: (id: number) => void;
  total: number;
  options?: OptionItem[];
}

export default function InputGroup({
  name,
  changeID,
  total,
  options,
}: InputGroupProps) {
  const items = options?.length
    ? options
    : Array.from({ length: total }, (_, i) => ({
        value: i + 1,
        label: `${name} ${i + 1}`,
      }));
  return (
    <div className="relative w-full max-w-xs mx-auto sm:mx-0">
      <select
        onChange={(e) => changeID(Number(e.target.value))}
        id={name}
        className="theme-input block w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-inner cursor-pointer appearance-none"
      >
        <option value="1">Choose {name}...</option>
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {name} {item.value} # {item.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-theme-muted">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
