import type { SearchContextState } from "@elastic/search-ui";
import React, { ReactElement } from "react";
import Select, { components } from "react-select";
import type { OptionProps } from "react-select";
import { BaseContainerProps, Rename } from "./types";

import { appendClassName } from "./view-helpers";

export type ResultsPerPageContainerContext = Pick<
  SearchContextState,
  "resultsPerPage" | "setResultsPerPage"
>;

export type ResultsPerPageContainerProps = BaseContainerProps & {
  view?: React.ComponentType<ResultsPerPageViewProps>;
  options?: number[];
};

export type ResultsPerPageViewProps = BaseContainerProps &
  Pick<ResultsPerPageContainerProps, "options"> &
  Rename<
    ResultsPerPageContainerContext,
    {
      setResultsPerPage: "onChange";
      resultsPerPage: "value";
    }
  >;

const setDefaultStyle = {
  option: () => ({}),
  control: () => ({}),
  dropdownIndicator: () => ({}),
  indicatorSeparator: () => ({}),
  singleValue: (provided) => {
    // Pulling out CSS that we don't want
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { position, top, transform, maxWidth, ...rest } = provided;
    return { ...rest, lineHeight: 1, marginRight: 0 };
  },
  valueContainer: (provided) => ({ ...provided, paddingRight: 0 })
};

const wrapOption = (option) => ({ label: option, value: option });

interface OptionDataProps {
  label: string;
  count: number;
}

function Option(props: OptionProps<OptionDataProps>): ReactElement {
  props.innerProps["data-transaction-name"] = `results per page`;

  return <components.Option {...props}>{props.data.label}</components.Option>;
}

function ResultsPerPage({
  className,
  onChange,
  options,
  value: selectedValue,
  ...rest
}: ResultsPerPageViewProps) {
  let selectedOption = null;

  if (selectedValue) {
    selectedOption = wrapOption(selectedValue);

    if (!options.includes(selectedValue)) options = [selectedValue, ...options];
  }

  return (
    <div
      className={appendClassName("sui-results-per-page", className)}
      {...rest}
    >
      <div className="sui-results-per-page__label">Show</div>
      <Select
        className="sui-select sui-select--inline"
        classNamePrefix="sui-select"
        value={selectedOption}
        onChange={(o) => onChange(o.value)}
        options={options.map(wrapOption)}
        isSearchable={false}
        styles={setDefaultStyle}
        components={{ Option }}
      />
    </div>
  );
}

export default ResultsPerPage;
