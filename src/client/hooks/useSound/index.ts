import React from "react";

import error from "./error.mp3";

const SOUNDS = {
	error,
};

const AUDIOS = {};

const loadAudio = (name) => {
	let audio = AUDIOS[name];

	if (audio === undefined) {
		audio = new Audio(SOUNDS[name]);

		AUDIOS[name] = audio;
	}

	return audio;
};

const useSound = (name) => {
	const audio = React.useState(loadAudio(name))[0];

	return () => audio.play();
};

export default useSound;
