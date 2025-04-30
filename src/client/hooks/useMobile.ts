import { useMediaQuery } from "@mantine/hooks";

export function useMobile() {
	return useMediaQuery("(max-width: 40em)") || false;
}
