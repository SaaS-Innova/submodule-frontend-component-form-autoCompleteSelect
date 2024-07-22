import { AutoComplete } from "primereact/autocomplete";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  dateTemplate,
  inputValidator,
} from "../../../../library/utilities/helperFunction";
import { useEffect, useRef, useState } from "react";
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
  } = (props && props.config) || {};
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
  } = props || {};
  const {
    handleOnLoad,
    isLoadMore,
    isNoRecordBtn,
    dropdownModeOption = "blank",
  } = LoadMore || {};
  const { label, options, placeholder } =
    (form && form[attribute as string]) || {};
  const { required, disabled } =
    (form && form[attribute as string].rules) || {};
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

  const itemTemplate = (item: IOptions) => {
    if (viewAs === AUTO_COMPLETE_SELECT_COMMON_TYPE.TABLE) {
      const finalData = Array.isArray(data)
        ? data.find((data: any) => data.id === item.value)
        : null;
      return (
        <div>
          {item.label === DEFAULT_LABEL_VALUE.HANDLE_LABEL ? (
            <>
              <div
                className={`flex justify-content-between align-items-center auto-complete-btn ${
                  column && column?.length >= 8 ? "gap-6" : "gap-1"
                }
                `}
              >
                {column?.map((field: IAutoCompleteSelectTableColumn) => (
                  <div className="w-4 font-bold" key={field.label}>
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
            </>
          ) : (
            <div
              className={`flex justify-content-between align-items-center ${
                column && column?.length >= 8 ? "gap-6" : "gap-1"
              }`}
            >
              <>
                {column?.map((field: IAutoCompleteSelectTableColumn) => (
                  <div className="w-4" key={field.label}>
                    {finalData && _.get(finalData, field.value)
                      ? field.label === "Created"
                        ? dateTemplate(_.get(finalData, field.value))
                        : _.get(finalData, field.value)
                      : ""}
                  </div>
                ))}
              </>
              {dialog && <div className="w-1"></div>}
            </div>
          )}
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
                    className="custom_add_button"
                  ></AppButton>
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

  const getClassNames = () => {
    let labelClassName = "";
    let fieldClassName = "";
    let divClassName = "";

    switch (fieldType) {
      case IFormFieldType.NO_LABEL:
        labelClassName = "";
        fieldClassName = "field p-fluid custom-item-table";
        divClassName = "";
        break;
      case IFormFieldType.TOP_LABEL:
        labelClassName = "";
        fieldClassName = "field p-fluid custom-item-table";
        divClassName = "";
        break;
      default:
        labelClassName = "col-12 mb-3 md:col-3 md:mb-0";
        fieldClassName = "field grid custom-item-table";
        divClassName = "col-12 md:col-9 relative";
        break;
    }

    return { labelClassName, fieldClassName, divClassName };
  };
  const { labelClassName, fieldClassName, divClassName } = getClassNames();

  const labelElement = (
    <label htmlFor={attribute} className={labelClassName}>
      {label} {required && "*"}
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
          }`}
        >
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
                dropdown
                dropdownMode={dropdownModeOption}
                id={attribute}
                {...field}
                field={attribute}
                suggestions={suggestionsList}
                value={selected || findObjectById(field.value)}
                completeMethod={filteredList || searchList}
                optionGroupLabel={optionGroupLabel}
                optionGroupChildren={optionGroupChildren}
                onChange={(e) => {
                  handleAutoCompleteSelectChange(e, field);
                }}
                onSelect={(e) => !onChange && field.onChange(e.value.value)}
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
