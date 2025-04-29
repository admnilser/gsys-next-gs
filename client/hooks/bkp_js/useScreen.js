import { useSelector } from "react-redux";

const useScreen = () => {
  const { width, height } = useSelector((state) => state.ui.screen || {});

  return {
    width,
    height,
    isSmall: width < 768,
    isTablet: width >= 768 && width <= 991,
    isLarge: width > 991,
  };
};

export default useScreen;
