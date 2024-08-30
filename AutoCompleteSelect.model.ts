import { AUTO_COMPLETE_SELECT_COMMON_TYPE } from "../../../../library/utilities/constant";
import { IAttribute_Object } from "../formInterface/forms.model";

export interface IAutoCompleteSelectTableColumn {
  label: string;
  value: string;
}

export interface IAutoCompleteSelectDropDownOption {
  label: string | any;
  value?: string | number;
  code?: string | number;
  items?: IAutoCompleteSelectDropDownOption[];
  extra_label?: string;
}

export interface IAutoCompleteSelectCommonConfig {
  attribute: string;
  form: {
    [attribute: string]: IAttribute_Object;
  };
  handleChange?: (data: any) => void;
  column?: IAutoCompleteSelectTableColumn[];
  data?: any;
  placeholder?: string;
  optionGroupTemplate?: (option: string) => JSX.Element;
  optionGroupLabel?: string;
  optionGroupChildren?: string;
  dropdownMode?: string;
  forceSelection?: boolean;
  options?: IAutoCompleteSelectDropDownOption[];
}
export interface IAutoCompleteSelectCommon {
  config?: IAutoCompleteSelectCommonConfig;
  searchMode?: "Wild" | "Exact";
  dialog?: (data: boolean) => void;
  viewAs?:
    | AUTO_COMPLETE_SELECT_COMMON_TYPE.DROPDOWN
    | AUTO_COMPLETE_SELECT_COMMON_TYPE.TABLE;
  onChange?: (e: any) => void;
  filteredList?: (data: any) => void;
  appendTo?: "self" | HTMLElement | undefined | null;
  fieldType?: "top-label" | "no-label";
  LoadMore?: {
    handleOnLoad: (e: any) => void;
    isLoadMore: boolean;
    dropdownModeOption: "blank" | "current";
    isNoRecordBtn: boolean;
  };
  prefixIcon?: {
    icon: string;
    handleClick: (e: any) => void;
  };
  dropdown?: boolean;
  multiple?: boolean;
}
