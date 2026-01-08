'use client';

import Link from 'next/link';
import type { BackgroundColorId, FontFamilyId } from '../dashboard/types';

const colorNames: Record<BackgroundColorId, string> = {
  'ivory': 'Ivory',
  'creamy-tan': 'Creamy Tan',
  'brown': 'Brown',
  'charcoal': 'Charcoal',
  'black': 'Black',
};

const fontNames: Record<FontFamilyId, string> = {
  'inter': 'Sans',
  'lora': 'Serif',
  'courier-prime': 'Typewriter',
  'shadows-into-light': 'Handwritten',
  'jacquard-24': 'Decorative',
};

interface ProfileHeaderProps {
  name: string;
  backgroundColor: BackgroundColorId;
  fontFamily: FontFamilyId;
}

export function ProfileHeader({ name, backgroundColor, fontFamily }: ProfileHeaderProps) {
  return (
    <header className="profile-header">
      <h1 className="profile-name">{name}</h1>
      <p className="profile-visual">
        {colorNames[backgroundColor]} + {fontNames[fontFamily]}
      </p>
      <Link href="/settings" className="profile-settings-link">
        Edit in Settings →
      </Link>
    </header>
  );
}
