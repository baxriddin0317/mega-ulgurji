import { useEffect } from "react";

export const useWhiteBody = () => {
  useEffect(() => {
    document.body.style.backgroundColor = "white";
    document.body.style.transition = "background-color 0.3s ease-in-out";
    return () => {
      document.body.style.backgroundColor = "black";
      document.body.style.transition = "";
    };
  }, []);
}; 