import React, { createContext, useContext, ReactNode, useState } from 'react';
import { ValidationFieldType } from 'PlaceOrder/types';

export interface Error {
  id: string | number;
  message: string;
}

interface ValidationInfo {
  errors: Error[],
  name: ValidationFieldType,
}

interface FormValidationContextProps {
  registerValidation: (name: ValidationFieldType, errorList: Error[]) => void;
  unregisterValidation: (name: ValidationFieldType) => void;
  validationErrors: ValidationInfo[];
  getValidationErrorsByName: (name: ValidationFieldType) => ValidationInfo | undefined;
}

const FormValidationContext = createContext<FormValidationContextProps>({
  registerValidation: () => { },
  unregisterValidation: () => { },
  validationErrors: [],
  getValidationErrorsByName: () => undefined,
});

export const useFormValidationContext = () => useContext(FormValidationContext);

export const FormValidationProvider = ({ children }: { children: ReactNode }) => {
  const [validationErrors, setValidationErrors] = useState<ValidationInfo[]>([]);

  const registerValidation = (name: ValidationFieldType, errorList: Error[]) => {
    setValidationErrors((prev: ValidationInfo[]) => [...prev, { name, errors: errorList }]);
  };

  const unregisterValidation = (name: ValidationFieldType) => {
    setValidationErrors(prev => prev.filter(item => item.name !== name));
  };

  const getValidationErrorsByName = (name: ValidationFieldType): ValidationInfo | undefined => validationErrors.find((item: ValidationInfo) => item.name === name);

  return (
    <FormValidationContext.Provider value={{ registerValidation, unregisterValidation, validationErrors, getValidationErrorsByName }}>
      {children}
    </FormValidationContext.Provider>
  );
};