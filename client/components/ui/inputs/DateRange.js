import React from "react";

import { useField } from "react-final-form";

import { Dropdown } from "semantic-ui-react";

import FlexBox from "../controls/FlexBox";

import Input from "./Input";
import DateInput from "./Date";
import Validators from "../Validators";

import _ from "utils";

const RangeOptionEnum = {
	0: { text: "Ontem" },
	1: { text: "Hoje" },
	2: { text: "Amanhã" },
	3: { text: "Semana Anterior" },
	4: { text: "Semana Atual" },
	5: { text: "Próxima Semana " },
	6: { text: "Mês Anterior" },
	7: { text: "Mês Atual" },
	8: { text: "Próximo Mês" },
};

const RANGE_OPTIONS = _.map(RangeOptionEnum, ({ text }, value) => ({
	value,
	text,
}));

const dateRangeError = (e, t) =>
	e && t
		? {
				content: e,
				pointing: "above",
			}
		: null;

const useDateRangeField = (props) => {
	const { name, value, onChange, attr1, attr2, required, ...rest } = props;

	const a1 = attr1 || `_gte${name}`;
	const a2 = attr2 || `_lte${name}`;

	const validate = (value, allValues) => {
		if (required && allValues) {
			const d1 = allValues[a1];
			const d2 = allValues[a2];
			return (
				Validators.required(d1, "Preencha a data inicial") ||
				Validators.required(d2, "Preencha a data final")
			);
		}
	};

	const {
		input: { value: v1, onChange: c1 },
		meta: { error: e1, touched: t1 },
	} = useField(a1, { ...rest, validate });

	const {
		input: { value: v2, onChange: c2 },
		meta: { error: e2, touched: t2 },
	} = useField(a2, { ...rest, validate });

	return {
		attr1: a1,
		attr2: a2,
		value1: v1,
		value2: v2,
		e1: dateRangeError(e1, t1),
		e2: dateRangeError(e2, t2),
		onChange: (d1, d2) => {
			c1(d1);
			c2(d2);
		},
	};
};

export class DateRange extends React.Component {
	static dates(d1, d2, r) {
		const today = _.today();
		const gte = r === "d" ? today : _.startOfMonth(today);
		const lte = r === "d" ? today : _.endOfMonth(today);

		return { [d1]: gte, [d2]: lte };
	}

	static range(f, r) {
		return DateRange.dates(`_gte${f}`, `_lte${f}`, r);
	}

	constructor(props) {
		super(props);
		this.handleChange = this.handleChange.bind(this);
		this.handleChangeRange = this.handleChangeRange.bind(this);
	}

	handleChange(d1, d2) {
		const { onChange } = this.props;
		onChange && onChange(d1, d2);
	}

	handleChangeRange(e, { value: range }) {
		let d1, d2;
		const today = _.today();
		switch (parseInt(range)) {
			case 0:
				d1 = _.addDays(today, -1);
				d2 = d1;
				break;
			case 1:
				d1 = today;
				d2 = d1;
				break;
			case 2:
				d1 = _.addDays(today, +1);
				d2 = d1;
				break;
			case 3:
				d1 = _.startOfWeek(_.addWeeks(today, -1));
				d2 = _.endOfWeek(d1);
				break;
			case 4:
				d1 = _.startOfWeek(today);
				d2 = _.endOfWeek(d1);
				break;
			case 5:
				d1 = _.startOfWeek(_.addWeeks(today, +1));
				d2 = _.endOfWeek(d1);
				break;
			case 6:
				d1 = _.startOfMonth(_.addMonths(today, -1));
				d2 = _.endOfMonth(d1);
				break;
			case 7:
				d1 = _.startOfMonth(today);
				d2 = _.endOfMonth(d1);
				break;
			case 8:
				d1 = _.startOfMonth(_.addMonths(today, +1));
				d2 = _.endOfMonth(d1);
				break;
			default:
				return;
		}

		this.handleChange(_.fmtDateISO(d1), _.fmtDateISO(d2));
	}

	render() {
		const { value1, value2, onBlur, compact } = this.props;

		return (
			<FlexBox
				className={_.classNames(["date-range", compact && "compact"])}
				gap={8}
			>
				<Dropdown
					className="button icon basic small"
					icon="bars"
					options={RANGE_OPTIONS}
					scrolling
					trigger={<></>}
					onChange={this.handleChangeRange}
				/>
				<DateInput
					value={value1}
					onChange={(date) => this.handleChange(date, value2)}
					onBlur={onBlur}
				/>
				<DateInput
					value={value2}
					onChange={(date) => this.handleChange(value1, date)}
					onBlur={onBlur}
				/>
			</FlexBox>
		);
	}
}

export const DateRangeControl = (props) => {
	const dateRangeProps = useDateRangeField(props);
	return <DateRange {...dateRangeProps} />;
};

export const DateRangeInput = ({ label, ...rest }) => {
	const { e1, e2, ...ctrlProps } = useDateRangeField(rest);

	return (
		<Input
			control={DateRangeControl}
			label={label}
			error={e1 || e2}
			{...ctrlProps}
		/>
	);
};
