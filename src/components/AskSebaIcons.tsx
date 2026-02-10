// src/components/AskSebaIcons.tsx — أيقونات Header مخصصة

export function SettingsIcon({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function UserAvatarIcon({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} >
      <defs>
        <linearGradient id="userGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#userGlow)" />
      <circle cx="12" cy="9" r="3.2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M6 19.5C6 16.742 8.686 14.5 12 14.5C15.314 14.5 18 16.742 18 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="13.8" cy="7.8" r="0.75" fill="inherit" opacity="0.25" />
    </svg>
  );
}

// Legacy export for backward compatibility — will be removed in Prompt 3
export function NotificationBellIcon({
  className = "",
  size = 20,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} >
      <defs>
        <linearGradient id="bellGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#bellGlow)" />
      <path d="M12 4.5C10.067 4.5 8.5 6.067 8.5 8V9.382C8.5 10.007 8.248 10.607 7.811 11.043L6.646 12.207C5.99 12.863 6.457 14 7.393 14H16.607C17.543 14 18.01 12.863 17.354 12.207L16.189 11.043C15.752 10.607 15.5 10.007 15.5 9.382V8C15.5 6.067 13.933 4.5 12 4.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 17C10.5 18.105 11.395 19 12.5 19C13.605 19 14.5 18.105 14.5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="3.5" r="0.75" fill="inherit" opacity="0.3" />
    </svg>
  );
}
