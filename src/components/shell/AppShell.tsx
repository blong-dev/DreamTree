'use client';

import { ReactNode, useState, useEffect } from 'react';
import { NavBar } from './NavBar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { InputArea } from './InputArea';
import { BreadcrumbLocation, InputType, NavItemId } from './types';

interface AppShellProps {
  children: ReactNode;
  currentLocation?: BreadcrumbLocation;
  showBreadcrumb?: boolean;
  showInput?: boolean;
  inputType?: InputType;
  inputValue?: string;
  inputPlaceholder?: string;
  onInputChange?: (value: string) => void;
  onInputSubmit?: (value: string) => void;
  activeNavItem?: NavItemId;
  onNavigate?: (id: NavItemId) => void;
  onBreadcrumbNavigate?: (location: Partial<BreadcrumbLocation>) => void;
}

export function AppShell({
  children,
  currentLocation,
  showBreadcrumb = true,
  showInput = true,
  inputType = 'text',
  inputValue,
  inputPlaceholder,
  onInputChange,
  onInputSubmit,
  activeNavItem,
  onNavigate,
  onBreadcrumbNavigate,
}: AppShellProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = (id: NavItemId) => {
    onNavigate?.(id);
  };

  return (
    <div className="app-shell">
      <NavBar
        position={isMobile ? 'bottom' : 'left'}
        activeItem={activeNavItem}
        onNavigate={handleNavigate}
        onExpandTools={() => handleNavigate('tools')}
      />

      <div className="app-shell-main">
        {showBreadcrumb && currentLocation && (
          <Header>
            <Breadcrumb
              location={currentLocation}
              onNavigate={onBreadcrumbNavigate}
            />
          </Header>
        )}

        <main className="app-shell-content">{children}</main>

        {showInput && inputType !== 'none' && (
          <InputArea
            type={inputType}
            value={inputValue}
            onChange={onInputChange}
            onSubmit={onInputSubmit}
            placeholder={inputPlaceholder}
          />
        )}
      </div>
    </div>
  );
}
