import React, { ReactNode } from 'react';
import { MealProvider } from './MealContext';

interface ContextProviderProps {
  children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  return (
    <MealProvider>
      {children}
    </MealProvider>
  );
};

// Add default export
export default ContextProvider;
