import React from "react";

export function useUndo<T>(initial: T) {
	const [state, setState] = React.useState<T>(initial);

	const stateRef = React.useRef<T>(initial);

	stateRef.current = state;

	const replace = (ssa: React.SetStateAction<T>) => {
		const undo = () => setState(state);
		setState(ssa);
		return undo;
	};

	const reset = () => setState(initial);

	const undo = () => setState(state);

	return { getState: () => stateRef.current, replace, undo, reset };
}
