import React from 'react';

export function BotanicalDivider({
  className = '',
  tone = 'gold',
}: {
  className?: string;
  tone?: 'gold' | 'forest' | 'ivory';
}) {
  const stroke =
    tone === 'forest' ? '#23483D' : tone === 'ivory' ? '#EFE2CC' : '#B69A61';

  return (
    <div
      className={`flex items-center justify-center gap-4 select-none ${className}`}
      aria-hidden="true"
    >
      <span
        className="h-px w-14 sm:w-24 opacity-45"
        style={{ backgroundColor: stroke }}
      />
      <svg
        width="36"
        height="18"
        viewBox="0 0 36 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 15C18 15 16.5 9.5 11.5 6.5C14.5 6.5 17 8 18 10.5C19 8 21.5 6.5 24.5 6.5C19.5 9.5 18 15 18 15Z"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 3V15"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="18" cy="2.5" r="1.3" fill={stroke} />
        <path
          d="M3 10.5C6.5 10.5 9 9 11 7.5"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M33 10.5C29.5 10.5 27 9 25 7.5"
          stroke={stroke}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <span
        className="h-px w-14 sm:w-24 opacity-45"
        style={{ backgroundColor: stroke }}
      />
    </div>
  );
}

export function InkNibFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M14 3L20 15L14 25L8 15L14 3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M14 3V14" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="14" cy="15" r="1.7" fill="currentColor" />
    </svg>
  );
}
