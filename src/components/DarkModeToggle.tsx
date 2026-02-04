// src/components/DarkModeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch and layout shift: reserve space with same dimensions
  if (!mounted) {
    return (
      <button
        className="theme-toggle group"
        disabled
        aria-hidden
        style={{ cursor: 'default' }}
      >
        <div className="icon-container">
          <span className="sr-only">Loading theme</span>
        </div>
      </button>
    );
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      className="theme-toggle group"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="icon-container">
        {/* أيقونة الشمس */}
        <svg
          className={`sun-icon transition-all duration-500 ${isDark ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="90" fill="#A8D8E6"/>
          <g id="sun">
            <circle cx="100" cy="100" r="40" fill="#FDB813"/>
            <path d="M100,50 L108,58 L116,50 L108,42 Z" fill="#FDB813"/>
            <path d="M150,100 L142,108 L150,116 L158,108 Z" fill="#FDB813"/>
            <path d="M100,150 L92,142 L84,150 L92,158 Z" fill="#FDB813"/>
            <path d="M50,100 L58,92 L50,84 L42,92 Z" fill="#FDB813"/>
            <path d="M135,65 L127,73 L135,81 L143,73 Z" fill="#FDB813"/>
            <path d="M135,135 L127,127 L119,135 L127,143 Z" fill="#FDB813"/>
            <path d="M65,135 L73,127 L65,119 L57,127 Z" fill="#FDB813"/>
            <path d="M65,65 L73,73 L81,65 L73,57 Z" fill="#FDB813"/>
          </g>
        </svg>

        {/* أيقونة القمر */}
        <svg
          className={`moon-icon transition-all duration-500 ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="90" fill="#1C2841"/>
          <circle cx="100" cy="100" r="35" fill="#F4E87C"/>
          <ellipse cx="95" cy="90" rx="5" ry="7" fill="#D4C65C" opacity="0.5"/>
          <ellipse cx="105" cy="105" rx="7" ry="9" fill="#D4C65C" opacity="0.5"/>
          <ellipse cx="90" cy="110" rx="4" ry="5" fill="#D4C65C" opacity="0.5"/>
        </svg>
      </div>
    </button>
  );
};

export default DarkModeToggle;
