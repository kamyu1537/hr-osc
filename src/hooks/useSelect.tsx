import React, { useState } from 'react';

function useSelect(
  attr: React.SelectHTMLAttributes<HTMLSelectElement>,
  options: { label: string; value: string }[],
  defaultValue?: string,
  onChange?: (val: string) => void
) {
  const [value, setValue] = useState(defaultValue || '');

  const component = (
    <select
      className="select-text block text-gray-400 text-sm w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 rounded-sm px-2 py-0.5 mb-2.5"
      {...attr}
      value={value + ''}
      onChange={(e) => {
        setValue(e.target.value);
        console.info('onChange', typeof e.target.value, e.target.value);
        onChange?.(e.target.value);
      }}
    >
      {options.map((item, idx) => (
        <option key={idx} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );

  return { value, onChange, component };
}

export default useSelect;
