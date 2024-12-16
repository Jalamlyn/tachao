import { UseFormReturn } from "react-hook-form";
import { FormField } from "../../../types";

export interface ClockInLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ClockInRecord {
  timestamp: string;
  type: "in" | "out";
  location?: ClockInLocation;
  note?: string;
}

export interface ClockInConfig {
  enableLocation?: boolean;
  requireNote?: boolean;
  modes?: ("in" | "out")[];
}

export interface ClockInProps extends FormField {
  form: UseFormReturn<any>;
  isEditable: boolean;
  onChange?: (fieldName: string, value: any) => void;
  config?: ClockInConfig;
}