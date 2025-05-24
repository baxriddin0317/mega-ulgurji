import { useEffect, useState } from 'react';

interface ScrollColorConfig {
  whiteSections: string[]; // CSS selector yoki element ID'lari
  transitionDuration?: string; // CSS transition davomiyligi
}

export const useScrollBodyColor = ({ 
  whiteSections, 
  transitionDuration = '0.3s' 
}: ScrollColorConfig) => {
  const [isWhiteSection, setIsWhiteSection] = useState(false);

  useEffect(() => {
    // Body elementiga transition qo'shish
    document.body.style.transition = `background-color ${transitionDuration} ease-in-out`;
    
    const handleScroll = () => {
      let shouldBeWhite = false;

      // Har bir white section uchun tekshirish
      whiteSections.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top;
          const elementBottom = rect.bottom;
          const windowHeight = window.innerHeight;

          // Element viewport da ko'rinishini tekshirish
          // Element 50% dan ko'proq ko'rinsa, white qilish
          const visibleHeight = Math.min(elementBottom, windowHeight) - Math.max(elementTop, 0);
          const elementHeight = rect.height;
          const visibilityPercentage = visibleHeight / elementHeight;

          if (visibilityPercentage > 0.1) {
            shouldBeWhite = true;
          }
        }
      });

      setIsWhiteSection(shouldBeWhite);
      
      // Body background rangini o'zgartirish
      if (shouldBeWhite) {
        document.body.style.backgroundColor = 'white';
      } else {
        document.body.style.backgroundColor = 'black';
      }
    };

    // Scroll event listener qo'shish
    window.addEventListener('scroll', handleScroll);
    
    // Dastlabki holat uchun bir marta chaqirish
    handleScroll();

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Component unmount bo'lganda default qiymatga qaytarish
      document.body.style.backgroundColor = 'black';
      document.body.style.transition = '';
    };
  }, [whiteSections, transitionDuration]);

  return isWhiteSection;
};