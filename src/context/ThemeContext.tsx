import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Appearance } from "react-native";

type ThemeType = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Başlangıçta sistem temasını al
  const colorScheme = Appearance.getColorScheme() as ThemeType;
  const [theme, setTheme] = useState<ThemeType>(colorScheme || "light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Sistem teması değiştiğinde güncelleme yapabilirsin (opsiyonel)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme as ThemeType);
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);