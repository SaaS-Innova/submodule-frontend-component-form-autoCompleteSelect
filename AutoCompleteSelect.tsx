import { AutoComplete } from "primereact/autocomplete";
import { Controller, useFormContext } from "react-hook-form";
import {
  dateTemplate,
  inputValidator,
} from "../../../../library/utilities/helperFunction";
import { useEffect, useRef, useState } from "react";
import _ from "lodash";
import {
  AUTO_COMPLETE_SELECT_COMMON_TYPE,
  IFormFieldType,
  SEARCH_MODE,
} from "../../../../library/utilities/constant";
import {
  IAutoCompleteSelectCommon,
  IAutoCompleteSelectTableColumn,
} from "./AutoCompleteSelect.model";
import AppButton from "../../button/AppButton";
import { fuseFilter } from "../formInterface/formHelper";
import { IOptions } from "../formInterface/forms.model";
import { FormFieldError } from "../formFieldError/FormFieldError";

export const AutoCompleteSelect = (props: IAutoCompleteSelectCommon) => {
  const {
    attribute,
    form,
    column,
    placeholder,
    optionGroupTemplate,
    optionGroupLabel,
    optionGroupChildren,
    forceSelection,
  } = (props && props.config) || {};
  const {
    dialog,
    viewAs = AUTO_COMPLETE_SELECT_COMMON_TYPE.DROPDOWN,
    filteredList,
    searchMode = SEARCH_MODE.EXACT,
    appendTo = "self",
    fieldType,
  } = props || {};
  const { label, options } = (form && form[attribute as string]) || {};
  const { required, disabled } =
    (form && form[attribute as string].rules) || {};
  const [suggestionsList, setSuggestionsList] = useState<any>(null);
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<any>(null);
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const filterOption = useRef<any>(
    _.debounce((options, query) => {
      setSuggestionsList(fuseFilter(options, query, searchMode));
    }, 300)
  );

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
      const finalData = Array.isArray(options)
        ? options.find((data: any) => data.id === item.value)
        : null;
      return (
        <div>
          {item.label === "Handle" ? (
            <>
              <div
                className={`flex justify-content-between align-items-center auto-complete-btn gap-1
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
              className={`flex justify-content-between align-items-center gap-1`}
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
        </div>
      );
    } else
      return (
        <>
          {item.label === "Handle" ? (
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
    return (options && options.find((item: any) => item.value === id)) || null;
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

  return (
    <div className={fieldClassName}>
      {fieldType !== IFormFieldType.NO_LABEL && labelElement}
      <div className={divClassName}>
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
              id={attribute}
              {...field}
              field={attribute}
              suggestions={suggestionsList}
              value={selected || findObjectById(field.value)}
              completeMethod={filteredList || searchList}
              optionGroupLabel={optionGroupLabel}
              optionGroupChildren={optionGroupChildren}
              onChange={(e) => {
                setSelected(e.value);
                field.onChange(e.value ? e.value.value : null);
              }}
              onSelect={(e) => field.onChange(e.value.value)}
              forceSelection={forceSelection}
              itemTemplate={itemTemplate}
              selectedItemTemplate={selectedItemTemplate}
              placeholder={placeholder}
              optionGroupTemplate={optionGroupTemplate}
              className={`w-full ${
                errors && errors[attribute as string] ? "p-invalid" : ""
              }`}
              appendTo={appendTo}
              disabled={disabled}
            />
          )}
        />
        <FormFieldError data={{ errors: errors, name: attribute as string }} />
      </div>
    </div>
  );
};
