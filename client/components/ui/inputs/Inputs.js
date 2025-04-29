import React from "react";

import { Icon } from "semantic-ui-react";

import { useForm } from "react-final-form";

import { useMerge } from "hooks";

import _, { Formatter } from "utils";

import { zipCode } from "utils/n2d";

import Check from "./Check";
import CheckList from "./CheckList";
import { Combo } from "./Combo";
import DatePicker from "./Date";
import { DateRangeControl, DateRangeInput } from "./DateRange";
import Detail from "./Detail";
import File from "./File";
import Label from "../Label";
import Lookup from "./Lookup";
import Memo from "./Memo";
import Money from "./Money";
import Numeric from "./Numeric";
import OptionCombo from "./OptionCombo";
import Text from "../Text";
import Radios from "./Radios";
import Spin from "./Spin";

const PHONE_MASK = (text) =>
	_.size(_.numbers(text)) > 10
		? _.toMask("(99) 9 9999-9999")
		: _.toMask("(99) 9999-9999");

const formatFile = (file) => {
	if (!file) return null;

	return _.isInstance(file, File)
		? {
				rawFile: file,
				src: URL.createObjectURL(file),
				title: file.name,
			}
		: file;
};

const formatFiles = (multiple) => (files) => {
	if (!files) return multiple ? [] : null;

	return Array.isArray(files) ? files.map(formatFile) : formatFile(files);
};

const PersonIDControl = ({ value, onChange, onBlur, onAccept, ...rest }) => {
	const [{ loading = false, text = "" }, setState] = useMerge({ text: value });

	const form = useForm();

	const handleAccept = (e) => {
		onBlur && onBlur(e);

		if (text !== value) {
			if (onAccept) {
				setState({ loading: true });
				Promise.resolve(onAccept(form, text))
					.then((accept) => {
						if (_.isString(accept)) onChange(text);
						else if (accept === false) setState({ text: value });
					})
					.finally(() => setState({ loading: false }));
			} else {
				onChange(text);
			}
		}
	};

	return (
		<Text
			loading={loading}
			value={text}
			onChange={(s) => setState({ text: s })}
			onBlur={handleAccept}
			{...rest}
		/>
	);
};

const Inputs = {
	DateRangeInput,
	Label: (props) => ({ control: Label, ...props }),
	Text: ({ type = "text", mask, ...rest }) => ({
		control: Text,
		mask: _.isString(mask)
			? mask === "phone"
				? PHONE_MASK
				: _.toMask(mask)
			: mask,
		type,
		...rest,
	}),
	Check: (props) => ({ control: Check, ...props }),
	Memo: (props) => ({ control: Memo, ...props }),
	PersonID: (props) => ({
		control: PersonIDControl,
		mask: (text) =>
			_.size(_.numbers(text)) > 11
				? _.toMask("99.999.999/9999-99")
				: _.toMask("999.999.999-99"),
		clearMask: true,
		...props,
	}),
	Phone: {
		control: Text,
		mask: PHONE_MASK,
		clearMask: true,
	},
	ZipCode: (props) => ({
		control: ZipCodeControl,
		numeric: true,
		...props,
	}),
	Lookup: (props) => ({
		control: Lookup,
		...props,
	}),
	City: (state) => ({
		control: Lookup,
		resource: "cid",
		txtField: "NOMCID",
		filter: { _likeCODCID: `${state}%` },
	}),
	Combo: (props) => ({ control: Combo, ...props }),
	ComboStr: ({ items, storeIndex = true, ...rest }) => {
		if (_.isString(items)) items = _.split(items, ",");

		const options = _.isArray(items)
			? _.map(items, (text, index) => ({
					value: storeIndex ? index : text,
					text,
				}))
			: [];

		return Inputs.Combo({ options, ...rest });
	},
	Choices: (opts) => ({ control: CheckList, options: _.split(opts, ",") }),
	Options: (props) => ({ control: OptionCombo, ...props }),
	Detail: (props) => ({ control: Detail, ...props }),
	Image: (props) => ({
		control: File,
		fileType: "img",
		parse: formatFiles(props?.multiple),
		format: formatFiles(props?.multiple),
		...props,
	}),
	Date: (props) => ({ control: DatePicker, defValue: _.todayStr(), ...props }),
	DateRange: (props) => ({ control: DateRangeControl, ...props }),
	File: (props) => ({ control: File, ...props }),
	Money: (props) => ({
		control: Money,
		defValue: 0,
		...props,
	}),
	MoneyLabel: (props) => ({
		control: Label,
		format: Formatter.Money,
		align: "right",
		...props,
	}),
	Number: (props) => ({
		control: Numeric,
		...props,
	}),
	Radios: (props) => ({ control: Radios, ...props }),
	Spin: (props) => ({ control: Spin, ...props }),
};

export default Inputs;
