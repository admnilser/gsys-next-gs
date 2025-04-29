import React from "react";

import { Checkbox } from "semantic-ui-react";

import { Field as FinalField, FormSpy, useForm } from "react-final-form";

import GridBox from "../controls/GridBox";

import Input from "./Input";
import Text from "./Text";
import Validators from "./Validators";

import _ from "utils";

const FieldComponent = ({
  name,
  input = {},
  defaultValue,
  required,
  validate,
  label,
  hint,
  width = "",
  onChange,
}) => {
  const {
    control = Text,
    clearMask,
    defValue = defaultValue,
    numeric,
    parse,
    format,
    ...controlProps
  } = input;

  const form = useForm();

  const renderInput = ({
    input: { value, onChange: inputChange, parse, format, ...inputProps },
    meta: { error, touched },
  }) => {
    const { size, readOnly } = form.mutators.options();
    return (
      <Input
        {...inputProps}
        {...controlProps}
        control={control}
        required={required}
        label={label}
        error={
          error && touched
            ? {
                content: error,
                pointing: "above",
              }
            : null
        }
        size={size}
        width={width}
        hint={hint}
        value={value}
        onChange={
          readOnly !== true
            ? (val, more) => {
                inputChange(val);

                if (more) {
                  form.batch(() =>
                    _.forEach(more, (v, k) => form.change(k, v))
                  );
                }

                onChange && onChange(val, value);
              }
            : undefined
        }
      />
    );
  };

  return control ? (
    <FinalField
      name={name}
      defaultValue={defValue}
      validate={(value, allValues) => {
        let err;

        if (required) err = Validators.required(value);

        if (!err) err = validate ? validate(value, allValues) : undefined;

        return err;
      }}
      parse={(value) => {
        let temp =
          clearMask || numeric ? (value ? _.numbers(value) : undefined) : value;

        if (numeric && temp) temp = parseInt(temp);

        return parse ? parse(temp) : temp;
      }}
      format={(value) => (_.isFunction(format) ? format(value) : value)}
      render={renderInput}
    />
  ) : null;
};

const FieldLabel = ({ text, checked, onToggle }) => (
  <FormSpy
    subscription={{ values: true }}
    render={(props) => {
      const check = checked(props);
      return (
        <label>
          <Checkbox
            label={text}
            checked={check}
            onChange={() => onToggle(!check, props)}
          />
        </label>
      );
    }}
  />
);

class Field extends React.Component {
  static Label = FieldLabel;

  render() {
    const { label, width, inline, style, ...rest } = this.props;

    return inline ? (
      <GridBox className="inline-field" cols="40% 60%" style={style}>
        <strong>{label}:</strong>
        <FieldComponent {...rest} fluid />
      </GridBox>
    ) : (
      <FieldComponent {...{ ...rest, label, width, style }} />
    );
  }
}

export default Field;
