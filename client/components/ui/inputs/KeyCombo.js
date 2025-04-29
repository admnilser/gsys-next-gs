import React from "react";

import FlexBox from "../controls/FlexBox";

import Text from "../Text";

import { Combo } from "./Combo";

const KeyCombo = ({ keyProps, value, onChange, ...rest }) => {
	const [key, setKey] = React.useState("");

	const { keyToVal, valToKey, ...restKeyProps } = keyProps || {};

	const submitKey = (e) => onChange && onChange(keyToVal ? keyToVal(key) : key);

	React.useEffect(() => setKey(valToKey ? valToKey(value) : value), [value]);

	return (
		<FlexBox>
			<Text
				value={key}
				onChange={(val) => setKey(val)}
				onKeyPress={({ charCode }) => {
					if (charCode === 13) submitKey();
				}}
				onBlur={submitKey}
				{...restKeyProps}
			/>
			<Combo value={value} onChange={onChange} tabIndex={-1} {...rest} />
		</FlexBox>
	);
};

export default KeyCombo;
