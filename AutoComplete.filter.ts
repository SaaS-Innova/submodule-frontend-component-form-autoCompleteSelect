import Fuse from "fuse.js";
import {
  DEFAULT_LABEL_VALUE,
  SEARCH_MODE,
} from "../../../../library/utilities/constant";
import { IOptions } from "../formInterface/forms.model";

const fuseOptionsLabel = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.0, // Substring match for label
  keys: ["label"],
  // isCaseSensitive: false,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
};

const fuseOptionsSearchString = {
  includeScore: true,
  shouldSort: true,
  threshold: 0.3, // Substring match for searchString
  keys: ["searchString"],
};

const fuseOptionsWildSearch = {
  includeScore: true,
  shouldSort: true,
  keys: ["label"],
};

export const fuseFilter = (
  dropDownOption: IOptions[],
  query: string,
  searchMode: string
) => {
  let fuseResult = [...(dropDownOption || [])];
  if (query.trim() !== "") {
    if (dropDownOption[0] && "searchString" in dropDownOption[0]) {
      const fuseOptions =
        searchMode === SEARCH_MODE.EXACT
          ? fuseOptionsSearchString
          : { ...fuseOptionsWildSearch, keys: ["searchString"] };
      const resultSearchString = new Fuse(dropDownOption, fuseOptions)
        .search(query)
        .map((x: any) => x.item);

      fuseResult = resultSearchString;
    } else if (dropDownOption[0] && searchMode === SEARCH_MODE.WILD) {
      fuseResult = new Fuse(dropDownOption, fuseOptionsWildSearch)
        .search(query)
        .map((x: any) => x.item);
    } else {
      const resultLabel = new Fuse(dropDownOption, fuseOptionsLabel)
        .search(query)
        .map((x: any) => x.item);
      fuseResult = resultLabel;
    }
    const labels = [
      DEFAULT_LABEL_VALUE.HANDLE_LABEL,
      DEFAULT_LABEL_VALUE.NO_MORE_RECORD_LABEL,
    ];
    fuseResult = fuseResult.filter((list: any) => !labels.includes(list.label));

    // Find default options
    const defaultOptionHandle = dropDownOption.find(
      (list) => list.label === DEFAULT_LABEL_VALUE.HANDLE_LABEL
    );
    const defaultOptionWithNoMoreRecord = dropDownOption.find(
      (list) => list.label === DEFAULT_LABEL_VALUE.NO_MORE_RECORD_LABEL
    );

    if (
      defaultOptionHandle &&
      !fuseResult.find(
        (list: any) => list.label === DEFAULT_LABEL_VALUE.HANDLE_LABEL
      )
    ) {
      fuseResult.unshift(defaultOptionHandle);
    }
    if (
      defaultOptionWithNoMoreRecord &&
      !fuseResult.find(
        (list: any) => list.label === DEFAULT_LABEL_VALUE.NO_MORE_RECORD_LABEL
      )
    ) {
      fuseResult.push(defaultOptionWithNoMoreRecord);
    }
  }

  return fuseResult;
};
