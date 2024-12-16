import { UseFormReturn } from "react-hook-form";
import { FormField } from "../../../types";

export interface LocationValue {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface LocationProps extends FormField {
  form: UseFormReturn<any>;
  isEditable: boolean;
  onChange?: (fieldName: string, value: any) => void;
}