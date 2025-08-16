import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useScrollBodyColor } from "@/hooks/useScrollBodyColor";

function AOSWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    AOS.init({
      easing: "ease-in-out",
      offset: 0,
      delay: 300,
      duration: 600
    });
  }, []);
  
  useEffect(() => {
    AOS.refresh();
  }, []);

  useScrollBodyColor({
    whiteSections: ['#category', '#products'],
    transitionDuration: '0.5s'
  });

  return <>{children}</>;
}

export default AOSWrapper;
