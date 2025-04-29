import React from "react";

/*import { Dropdown } from "semantic-ui-react";

import Button from "../controls/Button";

import _ from "utils";

const tryNumber = (v) => {
  const n = parseInt(v);
  return isNaN(n) ? v : n;
};

export const parseComboOptions = (items) => {
  let ids;
  let ops;

  if (_.includes(items, "@")) {
    const [s1, s2] = _.split(items, "@");
    ids = _.split(s1, "|") || [];
    ops = _.split(s2, "|");
  } else {
    ops = _.split(items, ",");
  }

  return ids
    ? ids.map((str, idx) => ({ value: tryNumber(str), text: ops[idx] }))
    : ops.map((str, idx) => {
        const [n, v] = _.split(str, "=");
        return { value: tryNumber(v) || idx, text: n };
      });
};

export const Combo = ({
  value = "",
  insertPage,
  insertFunc,
  multiple,
  noResultsMessage,
  disabled,
  onChange,
  onSearchChange,
  onSelect,
  onFocus,
  ...rest
}) => {
  const [{ adding = false, search = "" }, setState] = React.useState({});

  const handleFocus = (e) => {
    e.target.setAttribute("autocomplete", "disabled");
    onFocus && onFocus(e);
  };

  const handleChange = async (e, { value, options }) => {
    const val = multiple ? _.join(value, ",") : value;

    let data;
    if (!multiple && onSelect) {
      const opt = _.find(options, ["value", val]);
      if (opt) {
        data = await onSelect(opt.data || opt);
      }
    }

    onChange && onChange(val, data);
  };

  const handleSearchChange = (e, data) => {
    setState({ search: data.searchQuery });
    onSearchChange && onSearchChange(e, data);
  };

  const insertArgs =
    (insertPage || insertFunc) && search
      ? {
          query: search,
          onClose: (args) => {
            setState({});

            const { rec, options } = args || {};

            if (rec) {
              handleChange(null, {
                value: multiple ? _.concat(value, rec.id) : rec.id,
                options,
              });
            }
          },
        }
      : null;

  const comboValue = React.useMemo(
    () =>
      multiple
        ? value
          ? _.split(value, ",").map(tryNumber)
          : []
        : tryNumber(value),
    [multiple, value]
  );

  return (
    <>
      <Dropdown
        search
        clearable
        selection
        multiple={multiple}
        value={comboValue}
        noResultsMessage={
          insertArgs ? (
            <Button
              as="a"
              icon="plus circle"
              content={search ? `Adicionar "${search}"` : "Criar Novo"}
              size="tiny"
              onClick={() =>
                insertFunc
                  ? insertFunc(insertArgs)
                  : setState({ adding: true, search })
              }
              positive
              basic
              fluid
            />
          ) : (
            noResultsMessage || "Nenhum resultado!"
          )
        }
        selectOnBlur={false}
        selectOnNavigation={false}
        onFocus={handleFocus}
        onChange={handleChange}
        onSearchChange={handleSearchChange}
        disabled={disabled || !onChange}
        {...rest}
      />
      {adding && insertPage && insertPage(insertArgs)}
    </>
  );
};*/

export type ComboInputProps = {
	items: [];
};

export function ComboInput({ ...rest }: ComboInputProps) {
	return <input type="text" placeholder="Buscar..." />;
}
