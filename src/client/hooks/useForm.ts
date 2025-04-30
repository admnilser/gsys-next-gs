import React from "react";

import { shallowEqual } from "react-redux";

import { useMerge } from "./useMerge";

import {
	fn,
	type JsonValue,
	FormContext,
	type FormSubmitResult,
	type FormErrors,
	type FormInputOptions,
	type FormInputState,
	type FormState,
	type FormValues,
	type FormFieldOptions,
	type FormFields,
	type ValidatorFunc,
} from "@next-gs/client";

export type FormChangeHandler<FV extends FormValues> = (
	values: FV,
	field?: string,
) => FV | void;

export type UseFormProps<FV extends FormValues> = {
	values: FV;
	onSubmit?: (values: FV) => FormSubmitResult<FV>;
	onSubmited?: (values: FV) => void;
	onValidate?: (values: FV) => FormSubmitResult<FV>;
	onChange?: FormChangeHandler<FV>;
};

export interface UseFormReturn<FV extends FormValues> extends FormState<FV> {
	reset: (newValues?: FV) => void;
	submit: () => FormSubmitResult<FV>;
	handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	registerInput: (props: FormInputOptions) => FormInputState;
}

export const Validators = {
	required: ((val, more) => undefined) as ValidatorFunc,
};

export function useForm<FV extends FormValues>({
	values: initialValues,
	onSubmit,
	onValidate,
	onChange,
}: UseFormProps<FV>) {
	const [{ values, valid, submitting }, setState] = useMerge<FormState<FV>>({
		values: initialValues || ({} as FV),
		valid: false,
		submitting: false,
	});

	const fields = React.useRef({} as FormFields<FV>);

	const setErrors = (errors: FormErrors<FV>) => {
		const newFields = { ...fields.current };

		Object.keys(newFields).forEach((k) => {
			newFields[k].error = errors[k];
		});

		fields.current = newFields;
	};

	const checkField = (field: FormFieldOptions, value?: JsonValue) => {
		if (!field) return;

		let error: string | undefined = undefined;

		if (field.required) error = Validators.required(value);

		if (!error && fn.isFunction(field.validate))
			error = field.validate(value, values);

		return { ...field, error } as FormFieldOptions;
	};

	const change = (name: string, value: JsonValue, others: FormValues) => {
		const field = fields.current[name];
		if (!field || field.readonly) return;

		if (shallowEqual(values[name], value)) return;

		fields.current = { ...fields.current, [name]: checkField(field, value) };

		const error = fn.some(fields.current, (field) => fn.notEmpty(field.error));

		let newValues: FV = fn.assign({}, values, others, { [name]: value });

		if (onChange) {
			newValues = onChange(newValues, name) || values;
		}

		setState({
			values: newValues,
			valid: !error,
		});
	};

	const submit = async () => {
		setState({ submitting: true });
		try {
			if (onValidate) {
				const result = await onValidate(values);
				if (result) {
					setErrors(result);
					return;
				}
			}
			if (onSubmit) {
				const result = await onSubmit(values);
				if (fn.isObject(result)) setErrors(result);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setState({ submitting: false });
		}
	};

	const reset = (newValues: FV = initialValues) =>
		setState({ values: newValues, valid: false });

	const registerField = ({
		name,
		required,
		readonly,
		initial,
		validate,
	}: FormInputOptions) => {
		const field: FormFieldOptions = {
			name,
			required,
			readonly,
			validate,
			touched: false,
			initial,
		};

		fields.current = { ...fields.current, [name]: field };

		return field;
	};

	const registerInput = (input: FormInputOptions) => {
		const {
			name,
			label,
			required,
			initial,
			disabled = false,
			parse,
			format,
			...inputRest
		} = input;

		let field = fields.current[name];

		if (!field) field = registerField(input);

		const { error, touched } = field;

		let value = name in values ? values[name] : initial;
		if (format) value = format(value);

		return {
			name,
			label,
			error: touched ? error : undefined,
			disabled: fn.resolve(disabled, values),
			value,
			required,
			onChange: (value: JsonValue) => {
				change(name, parse ? parse(value) : value, values);
			},
			onFocus: () => {
				fields.current = {
					...fields.current,
					[name]: { ...field, touched: true },
				};
			},
			onBlur: () => {
				fields.current = { ...fields.current, [name]: checkField(field) };
			},
			...inputRest,
		} as FormInputState;
	};

	return {
		fields,
		values,
		submitting,
		valid,
		submit,
		reset,
		change,
		handleSubmit: (e) => {
			e.preventDefault();
			submit();
		},
		registerField,
		registerInput,
	} as UseFormReturn<FV>;
}

export function useFormContext() {
	return React.useContext(FormContext) as UseFormReturn<FormValues>;
}
