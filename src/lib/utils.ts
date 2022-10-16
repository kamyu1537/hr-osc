export const cn = (...classNames: unknown[]) => {
  return classNames.filter(Boolean).join(' ');
};
