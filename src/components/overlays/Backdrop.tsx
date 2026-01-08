'use client';

interface BackdropProps {
  visible: boolean;
  onClick: () => void;
}

export function Backdrop({ visible, onClick }: BackdropProps) {
  if (!visible) return null;

  return (
    <div
      className="backdrop"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
