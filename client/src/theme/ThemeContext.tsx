import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
type Ctx = { isLight: boolean; toggle: () => void };
const ThemeContext = createContext<Ctx>({ isLight: true, toggle: () => {} });

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isLight, setIsLight] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", !isLight);
  }, [isLight]);
  const value = useMemo(
    () => ({ isLight, toggle: () => setIsLight((s) => !s) }),
    [isLight]
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);
