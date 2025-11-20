import React, { createContext, useContext } from 'react';
import { useAnalysis } from '../hooks/useAnalysis';

const AnalysisContext = createContext();

export const useAnalysisContext = () => useContext(AnalysisContext);

export const AnalysisProvider = ({ children }) => {
  const analysisState = useAnalysis();
  return (
    <AnalysisContext.Provider value={analysisState}>
      {children}
    </AnalysisContext.Provider>
  );
};
