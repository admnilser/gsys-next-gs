"use client";

import {
	Alert,
	Drawer,
	Group,
	Modal,
	LoadingOverlay,
	Text,
	Divider,
	Stack,
	Grid,
	type AlertProps,
	type BoxProps,
	type GroupProps,
	type GridColProps,
} from "@mantine/core";

import {
	Icon,
	Button,
	FormProvider,
	useForm,
	useFormContext,
	type Optional,
	type FormInputOptions,
	type FormValues,
	type UseFormProps,
	type ButtonProps,
	type IconName,
} from "@next-gs/client";

export type FormProps<FV extends FormValues> = React.PropsWithChildren &
	Optional<UseFormProps<FV>, "onSubmit"> & {
		action?: string;
	};

export function Form<FV extends FormValues>({
	action,
	children,
	onSubmit,
	...props
}: FormProps<FV>) {
	const form = useForm({
		...props,
		onSubmit: async (values: FormValues) => {
			console.log("submit", values);
			/*let errors: FormSubmitResult = undefined;
	
			if (onSubmit) {
				errors = await onSubmit(values);
			} else if (action) {
				const resp = await fetchJson<FormValues, { errors: FormErrors }>({
					path: action,
					method: "POST",
					data: values,
				});
				errors = resp.errors;
			}
	
			if (errors) form.setErrors(errors);
			else onSubmited?.(values);*/
		},
	});

	return (
		<FormProvider form={form}>
			<form onSubmit={form.handleSubmit}>{children}</form>
		</FormProvider>
	);
}

export interface FormHeadProps extends React.PropsWithChildren<GroupProps> {
	icon?: IconName;
	title?: string;
}

export function FormHead({ icon, title, children }: FormHeadProps) {
	return (
		<Text component={Group} className="bb" p="sm" fw={500}>
			{children || (
				<>
					{icon && <Icon name={icon} />}
					{title}
				</>
			)}
		</Text>
	);
}

export function useGridColumnSpan(width: string) {
	const [base, sm, md, lg] = width.split(",").map((s) => Number.parseInt(s));
	return { base, sm, md, lg };
}

export type FormGridProps = React.PropsWithChildren<BoxProps> & {
	root?: boolean;
	width?: string;
};

export function FormGrid({ root, width = "16", children }: FormGridProps) {
	const grid = (
		<Grid type="container" columns={16}>
			{children}
		</Grid>
	);

	if (root) return grid;

	const span = useGridColumnSpan(width);

	return <Grid.Col span={span}>{grid}</Grid.Col>;
}

export type FormBodyProps = React.PropsWithChildren & {
	tabs?: boolean;
};

export function FormBody({ tabs, children }: FormBodyProps) {
	const { submitting } = useFormContext();
	return (
		<Stack p="xs" gap="xs">
			<LoadingOverlay visible={submitting} />
			<FormGrid root>{children}</FormGrid>
		</Stack>
	);
}

export type FormFootProps = React.PropsWithChildren<GroupProps>;

export function FormFoot(props: FormFootProps) {
	return (
		<>
			<Divider my="sm" />
			<Group p="xs" {...props} />
		</>
	);
}

export const FormButton = Button;

export function FormSubmit({ children, ...props }: ButtonProps) {
	return (
		<FormButton type="submit" {...props}>
			{children || "Salvar"}
		</FormButton>
	);
}

export interface FormColumnProps extends GridColProps {
	width: string;
}

export function FormColumn({ width, children }: FormColumnProps) {
	const span = useGridColumnSpan(width);

	return <Grid.Col span={span}>{children}</Grid.Col>;
}

export type FormFieldInputProps<P> = P & {
	component: React.ComponentType<P>;
};

export type FormFieldBaseProps<P> = FormInputOptions & {
	input: FormFieldInputProps<P>;
	width?: string;
	loading?: boolean;
};

export type FormFieldProps<P> = Omit<FormFieldBaseProps<P>, "input"> & {
	input?: Omit<P, "value" | "onChange">;
};

export function FormField<P>({
	input: { component, ...custInputProps },
	width,
	name,
	label,
	initial,
	parse,
	format,
	...restProps
}: FormFieldBaseProps<P>) {
	const form = useFormContext();

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const InputComponent = component as React.ComponentType<any>;

	const formInputProps = form.registerInput({
		name,
		label,
		initial,
		parse,
		format,
	});

	const input = (
		<InputComponent {...restProps} {...custInputProps} {...formInputProps} />
	);

	return width ? <FormColumn width={width}>{input}</FormColumn> : input;
}

export interface FormErrorProps extends AlertProps {
	error?: string | null;
}

export function FormError({ error, ...rest }: FormErrorProps) {
	return error ? (
		<Alert
			variant="light"
			color="red"
			title="Erro"
			icon={<Icon name="ban" />}
			withCloseButton
			{...rest}
		>
			{error}
		</Alert>
	) : null;
}

export interface FormSpyProps {
	render: (values: FormValues) => React.ReactNode;
}

export function FormSpy({ render }: FormSpyProps) {
	const form = useFormContext();
	return render?.(form.values) || null;
}
export type FormSceneType = "drawer" | "modal" | "normal";

export interface FormSceneProps extends React.PropsWithChildren {
	type?: FormSceneType;
	opened: boolean;
	onClose: () => void;
}

export function FormScene({ type, opened, onClose, children }: FormSceneProps) {
	const mounted = Boolean(opened && children);

	if (type === "drawer") {
		return (
			<Drawer
				opened={mounted}
				onClose={onClose}
				withCloseButton={false}
				position="right"
			>
				{children}
			</Drawer>
		);
	}

	if (type === "modal") {
		return (
			<Modal opened={mounted} onClose={onClose} withCloseButton={false}>
				{children}
			</Modal>
		);
	}

	return children;
}
