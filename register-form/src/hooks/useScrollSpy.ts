import React, { useState, useEffect, useMemo } from 'react';

const useScrollSpy = (elementRefs: React.RefObject<HTMLElement | null>[], options?: IntersectionObserverInit): string | null => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const observerOptions = useMemo(() => {
    return options || {
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };
  }, [options]);

  useEffect(() => {
    if (elementRefs.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id) {
                setActiveSection(id);
            }
        }
      });
    }, observerOptions);

    elementRefs.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      elementRefs.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [elementRefs, observerOptions]);

  return activeSection;
};

export default useScrollSpy;