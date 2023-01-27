import React, { useState } from 'react';

function useInput<T>(attr: React.InputHTMLAttributes<HTMLInputElement>, defaultValue?: T, onChange?: (val: T) => void) {
  const [value, setValue] = useState(defaultValue || '');
  const [timeout, setTimeoutVal] = useState<ReturnType<typeof setTimeout>>();

  const component = (
    <input
      className="select-text block text-gray-400 text-sm w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 rounded-sm px-2 py-0.5 mb-2.5"
      {...attr}
      value={value + ''}
      onChange={(e) => {
        clearTimeout(timeout);
        setValue(e.target.value);
        setTimeoutVal(
          setTimeout(() => {
            console.info('onChange', typeof e.target.value, e.target.value);
            if (typeof defaultValue === 'number') {
              onChange?.(Number(e.target.value) as T);
            } else if (typeof defaultValue === 'number') {
              onChange?.(Boolean(e.target.value) as T);
            } else {
              onChange?.(e.target.value as T);
            }
          }, 500)
        );
      }}
    />
  );

  return { value, onChange, component };
}

export default useInput;
