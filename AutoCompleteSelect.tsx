import { AutoComplete } from "primereact/autocomplete";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  dateTemplate,
  inputValidator,
} from "../../../../library/utilities/helperFunction";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  AUTO_COMPLETE_SELECT_COMMON_TYPE,
  BUTTON_TYPE,
  DEFAULT_LABEL_VALUE,
  IFormFieldType,
  SEARCH_MODE,
} from "../../../../library/utilities/constant";
import {
  IAutoCompleteSelectCommon,
  IAutoCompleteSelectTableColumn,
} from "./AutoCompleteSelect.model";
import AppButton from "../../button/AppButton";
import { fuseFilter } from "./AutoComplete.filter";
import { IOptions } from "../formInterface/forms.model";
import { FormFieldError } from "../formFieldError/FormFieldError";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { Chip } from "primereact/chip";

export const AutoCompleteSelect = (props: IAutoCompleteSelectCommon) => {
  const {
    attribute,
    form,
    column,
    optionGroupTemplate,
    optionGroupLabel,
    optionGroupChildren,
    forceSelection,
    data,
    formatDateField,
  } = props?.config || {};
  const { t } = useTranslation();
  const {
    dialog,
    viewAs = AUTO_COMPLETE_SELECT_COMMON_TYPE.DROPDOWN,
    filteredList,
    searchMode = SEARCH_MODE.EXACT,
    appendTo = "self",
    fieldType,
    LoadMore,
    onChange,
    dropdown = true,
    multiple = false,
  } = props || {};
  const {
    handleOnLoad,
    isLoadMore,
    isNoRecordBtn,
    dropdownModeOption = "blank",
  } = LoadMore || {};
  const { label, options, placeholder, extraLabelElementContent } =
    form?.[attribute as string] || {};
  const { required, disabled } = form?.[attribute as string]?.rules || {};
  const { icon, handleClick } = props.prefixIcon || {};
  const [suggestionsList, setSuggestionsList] = useState<any>(null);
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<any>(null);
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const defaultPlaceHolder: string = t("components.multiSelect.placeholder");
  const filterOption = useRef<any>(
    _.debounce((options, query) => {
      setSuggestionsList(fuseFilter(options, query, searchMode));
    }, 300)
  );
  const autoCompleteAttributeValue = useWatch({
    control: control,
    name: attribute as string,
  });

  useEffect(() => {
    if (autoCompleteAttributeValue === null) {
      setSelected(null);
    }
  }, [autoCompleteAttributeValue]);

  const searchList = (event: { query: string }) => {
    setQuery(event.query);
    filterOption.current(options, event.query);
  };

  useEffect(() => {
    if (options && query === "") {
      setSuggestionsList(options);
    } else if (options) {
      searchList({ query: query });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const renderFieldValue = (
    finalData: any,
    field: IAutoCompleteSelectTableColumn,
    formatDateField?: string[]
  ): React.ReactNode => {
    const value = _.get(finalData, field.value);

    if (!value) return null;

    const isDateField =
      field.label === "Created" || formatDateField?.includes(field.label);
    const isChipField = field.isValueShowInChip;

    if (isDateField) {
      return dateTemplate(value);
    }

    if (isChipField) {
      return Array.isArray(value) ? (
        value.map((option: string) => (
          <div className="p-1" key={option}>
            <Chip className="pl-3 pr-3" label={option} />
          </div>
        ))
      ) : (
        <Chip className="pl-3 pr-3" label={value} />
      );
    }

    return value;
  };

  const renderHeader = () => {
    return (
      <div
        className={`flex justify-content-between align-items-center auto-complete-btn ${
          column && column.length >= 8 ? "gap-6" : "gap-1"
        }`}>
        {column?.map((field: IAutoCompleteSelectTableColumn) => (
          <div
            className={`${
              field?.width ?? "w-4"
            }  font-bold white-space-normal capitalize-first `}
            key={field.label}>
            {field.label}
          </div>
        ))}
        {dialog && (
          <div className="w-1">
            <AppButton
              type="Add"
              onMouseDown={() => dialog(true)}
              className="custom_add_button"
            />
          </div>
        )}
      </div>
    );
  };

  const renderRow = (finalData: any) => {
    return (
      <div
        className={`flex justify-content-between align-items-center ${
          column && column.length >= 8 ? "gap-6" : "gap-1"
        }`}>
        {column?.map((field: IAutoCompleteSelectTableColumn) => (
          <div
            className={`${field?.width ?? "w-4"} white-space-normal`}
            key={field.label}>
            {finalData && _.get(finalData, field.value)
              ? renderFieldValue(finalData, field, formatDateField)
              : ""}
          </div>
        ))}
        {dialog && <div className="w-1"></div>}
      </div>
    );
  };

  const itemTemplate = (item: IOptions) => {
    if (viewAs === AUTO_COMPLETE_SELECT_COMMON_TYPE.TABLE) {
      const finalData = Array.isArray(data)
        ? data.find((data: any) => data.id === item.value)
        : null;
      return (
        <div>
          {item.label === DEFAULT_LABEL_VALUE.HANDLE_LABEL
            ? renderHeader()
            : renderRow(finalData)}

          {isNoRecordBtn &&
            item.label === DEFAULT_LABEL_VALUE.NO_MORE_RECORD_LABEL && (
              <div className="w-full text-center">
                {t("components.button.message.noMoreRecordsToLoad")}
              </div>
            )}
        </div>
      );
    } else
      return (
        <>
          {item.label === DEFAULT_LABEL_VALUE.HANDLE_LABEL ? (
            <div className="flex justify-content-between">
              {dialog && (
                <>
                  <div className="font-bold align-self-center">Result</div>
                  <AppButton
                    type="Add"
                    onMouseDown={() => dialog && dialog(true)}
                    className="custom_add_button"></AppButton>
                </>
              )}
            </div>
          ) : (
            <div>{item.label}</div>
          )}
        </>
      );
  };

  const selectedItemTemplate = (item: IOptions) => {
    if (item.extra_label) {
      return `${item.extra_label} -${item.label}`;
    } else {
      return `${item.label}`;
    }
  };

  const findObjectById = (id: any) => {
    if (
      !id ||
      DEFAULT_LABEL_VALUE.HANDLE_VALUE === id ||
      DEFAULT_LABEL_VALUE.NO_MORE_RECORD_VALUE === id
    )
      return null;
    let selectOption: any;
    options?.some((option: any) => {
      if (option.items) {
        return option.items.some((y: any) => {
          if (y.value === id) {
            selectOption = y;
            return true;
          }
          return false;
        });
      } else if (option.value === id) {
        selectOption = option;
        return true;
      }
      return false;
    });
    return selectOption || null;
  };

  const { labelClassName, fieldClassName, divClassName } = useMemo(() => {
    switch (fieldType) {
      case IFormFieldType.NO_LABEL:
      case IFormFieldType.TOP_LABEL:
        return {
          labelClassName: "",
          fieldClassName: "field p-fluid custom-item-table",
          divClassName: "",
        };
      default:
        return {
          labelClassName: "col-12 mb-3 md:col-3 md:mb-0",
          fieldClassName: "field grid custom-item-table",
          divClassName: "col-12 md:col-9 relative",
        };
    }
  }, [fieldType]);

  const labelElement = (
    <label htmlFor={attribute} className={labelClassName}>
      <span className="capitalize-first">
        {label} {required && "*"}
      </span>
      {extraLabelElementContent && extraLabelElementContent}
    </label>
  );
  const handleAutoCompleteSelectChange = (e: any, field: any) => {
    const isHandle = e.value?.label === DEFAULT_LABEL_VALUE.HANDLE_LABEL;
    const isNoMoreRecord =
      e.value?.label === DEFAULT_LABEL_VALUE.NO_MORE_RECORD_LABEL;
    if (isHandle || isNoMoreRecord) {
      setSelected(null);
      field.onChange(null);
    } else {
      if (onChange) {
        onChange(e);
        setSelected(e.value);
      } else {
        setSelected(e.value);
        field.onChange(e.value ? e.value.value : null);
      }
    }
  };
  return (
    <div className={fieldClassName}>
      {fieldType !== IFormFieldType.NO_LABEL && labelElement}
      <div className={divClassName}>
        <div
          className={`flex ${
            props.prefixIcon && icon && handleClick ? "p-inputgroup" : ""
          }`}>
          {props.prefixIcon && icon && handleClick && (
            <span className="p-inputgroup-addon bg-white cursor-pointer">
              <i className={icon} onClick={handleClick}></i>
            </span>
          )}
          <Controller
            name={attribute as string}
            control={control}
            rules={inputValidator(
              form?.[attribute as string]?.rules ?? {},
              label as string
            )}
            render={({ field }) => (
              <AutoComplete
                dropdown={dropdown}
                multiple={multiple}
                dropdownMode={dropdownModeOption}
                id={attribute}
                field={attribute}
                suggestions={suggestionsList}
                value={selected || findObjectById(field.value)}
                completeMethod={filteredList || searchList}
                optionGroupLabel={optionGroupLabel}
                optionGroupChildren={optionGroupChildren}
                onChange={(e) => {
                  handleAutoCompleteSelectChange(e, field);
                }}
                forceSelection={forceSelection}
                itemTemplate={itemTemplate}
                selectedItemTemplate={selectedItemTemplate}
                placeholder={placeholder || defaultPlaceHolder}
                optionGroupTemplate={optionGroupTemplate}
                className={`w-full ${
                  errors && errors[attribute as string] ? "p-invalid" : ""
                }`}
                appendTo={appendTo}
                disabled={disabled}
              />
            )}
          />
          {isLoadMore && handleOnLoad && (
            <AppButton
              type={BUTTON_TYPE.MORE_LOAD}
              onClick={handleOnLoad}
              className="ml-2 w-auto"
            />
          )}
        </div>
        <FormFieldError data={{ errors: errors, name: attribute as string }} />
      </div>
    </div>
  );
};
