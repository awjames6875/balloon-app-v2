import { createContext, useContext, useState, ReactNode } from "react";
import { Design } from "@/types";

interface DesignContextType {
  activeDesign: Design | null;
  setActiveDesign: (design: Design | null) => void;
  resetActiveDesign: () => void;
}

const DesignContext = createContext<DesignContextType>({
  activeDesign: null,
  setActiveDesign: () => {},
  resetActiveDesign: () => {},
});

export const useDesign = () => useContext(DesignContext);

interface DesignProviderProps {
  children: ReactNode;
}

export const DesignProvider = ({ children }: DesignProviderProps) => {
  const [activeDesign, setActiveDesign] = useState<Design | null>(null);

  const resetActiveDesign = () => {
    setActiveDesign(null);
  };

  return (
    <DesignContext.Provider
      value={{
        activeDesign,
        setActiveDesign,
        resetActiveDesign,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
};
