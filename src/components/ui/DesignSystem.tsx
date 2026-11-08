import React from 'react';
import { ArrowLeft, Check, ChevronDown, ChevronRight, Loader2, Search, X } from 'lucide-react';
import { CoinIcon } from '../CoinIcon';

/* ============================================================================
   NEXUSTRADE PHASE 2: SHARED DESIGN SYSTEM PRIMITIVES
   ============================================================================ */

/* ----------------------------------------------------------------------------
   1. BUTTONS (NTButton)
   ---------------------------------------------------------------------------- */
export type NTButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'up'
  | 'down'
  | 'muted-yellow'
  | 'muted-red'
  | 'outline';

export type NTButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface NTButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: NTButtonVariant;
  size?: NTButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const NTButton: React.FC<NTButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const variantClasses: Record<NTButtonVariant, string> = {
    primary: 'bg-[#FCD535] hover:bg-[#F0B90B] text-[#181A20] font-semibold',
    secondary: 'bg-[#2B3139] hover:bg-[#333B47] text-[#EAECEF] font-semibold',
    ghost: 'bg-transparent hover:bg-[#202630] text-[#848E9C] hover:text-[#EAECEF] font-medium',
    up: 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white font-bold',
    down: 'bg-[#F6465D] hover:bg-[#F6465D]/90 text-white font-bold',
    'muted-yellow': 'bg-[#655A24] text-[#848E9C] font-bold',
    'muted-red': 'bg-[#7A2736] text-[#848E9C] font-bold',
    outline: 'bg-transparent border border-[#2B3139] hover:border-[#474D57] text-[#EAECEF] font-medium',
  };

  const sizeClasses: Record<NTButtonSize, string> = {
    xs: 'h-7 px-2.5 text-xs rounded-md gap-1',
    sm: 'h-9 px-3.5 text-xs rounded-lg gap-1.5',
    md: 'h-10 px-4 text-sm rounded-lg gap-2',
    lg: 'h-11 px-5 text-sm rounded-xl gap-2',
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none whitespace-nowrap active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

/* ----------------------------------------------------------------------------
   2. INPUT FIELDS (NTInputField)
   ---------------------------------------------------------------------------- */
export interface NTInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: React.ReactNode;
  rightLabel?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  containerClassName?: string;
  numeric?: boolean;
}

export const NTInputField: React.FC<NTInputFieldProps> = ({
  label,
  rightLabel,
  prefix,
  suffix,
  error,
  containerClassName = '',
  className = '',
  numeric = false,
  ...props
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {(label || rightLabel) && (
        <div className="flex items-center justify-between text-xs text-[#848E9C] mb-1.5">
          <span>{label}</span>
          {rightLabel && <span className="tabular-nums">{rightLabel}</span>}
        </div>
      )}
      <div
        className={`h-10 rounded-xl bg-[#202630] px-3 flex items-center justify-between gap-2 transition-shadow focus-within:ring-1 ${
          error ? 'ring-1 ring-[#F6465D]' : 'focus-within:ring-[#F0B90B]'
        }`}
      >
        {prefix && <div className="shrink-0 flex items-center">{prefix}</div>}
        <input
          className={`w-full bg-transparent text-sm text-[#EAECEF] placeholder-[#474D57] focus:outline-none min-w-0 ${
            numeric ? 'tabular-nums font-semibold text-right' : 'font-medium'
          } ${className}`}
          {...props}
        />
        {suffix && <div className="shrink-0 flex items-center text-xs text-[#848E9C]">{suffix}</div>}
      </div>
      {error && <p className="mt-1 text-[11px] text-[#F6465D]">{error}</p>}
    </div>
  );
};

/* ----------------------------------------------------------------------------
   3. SEARCH BARS (NTSearchBar)
   ---------------------------------------------------------------------------- */
export interface NTSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  onClick?: () => void;
  readOnly?: boolean;
  className?: string;
}

export const NTSearchBar: React.FC<NTSearchBarProps> = ({
  value = '',
  onChange,
  placeholder = 'Search coins and trends',
  leftIcon,
  rightAction,
  onClick,
  readOnly = false,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`h-9 w-full rounded-xl bg-[#202630] px-3 flex items-center justify-between gap-2 text-[#848E9C] focus-within:ring-1 focus-within:ring-[#F0B90B]/60 transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {leftIcon !== undefined ? leftIcon : <Search className="w-4 h-4 text-[#848E9C] shrink-0" />}
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13px] font-medium text-[#EAECEF] placeholder-[#848E9C] focus:outline-none truncate"
        />
        {value && onChange && !readOnly && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-[#848E9C] hover:text-[#EAECEF] p-0.5 shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {rightAction && <div className="shrink-0 flex items-center">{rightAction}</div>}
    </div>
  );
};

/* ----------------------------------------------------------------------------
   4. TABS (NTTabs)
   Supports:
   - 'primary' (Top screen mode bar: 18px bold active, 15px muted inactive, no underline)
   - 'underline' (Section tabs: 14px bold active + short 16px x 3px #F0B90B indicator)
   - 'pill' (Filter strip pills: #2B3139 active pill)
   ---------------------------------------------------------------------------- */
export interface NTTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
  dot?: boolean;
}

export interface NTTabsProps<T extends string = string> {
  items: NTTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  variant?: 'primary' | 'underline' | 'pill';
  rightSlot?: React.ReactNode;
  className?: string;
}

export function NTTabs<T extends string = string>({
  items,
  activeId,
  onChange,
  variant = 'underline',
  rightSlot,
  className = '',
}: NTTabsProps<T>) {
  return (
    <div className={`flex items-center justify-between gap-2 w-full ${className}`}>
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar min-w-0 flex-1">
        {items.map((item) => {
          const active = item.id === activeId;

          if (variant === 'primary') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`py-1.5 whitespace-nowrap transition-colors shrink-0 flex items-center gap-1 ${
                  active
                    ? 'text-[18px] font-bold text-[#EAECEF]'
                    : 'text-[15px] font-medium text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                <span>{item.label}</span>
                {item.badge}
                {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B]" />}
              </button>
            );
          }

          if (variant === 'pill') {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
                  active
                    ? 'bg-[#2B3139] text-[#EAECEF] font-semibold'
                    : 'text-[#848E9C] hover:text-[#EAECEF] font-medium'
                }`}
              >
                <span>{item.label}</span>
                {item.badge}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`relative py-2 text-sm whitespace-nowrap transition-colors shrink-0 flex items-center gap-1 ${
                active ? 'font-bold text-[#EAECEF]' : 'font-medium text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              <span>{item.label}</span>
              {item.badge}
              {item.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] -mt-2" />}
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full bg-[#F0B90B]" />
              )}
            </button>
          );
        })}
      </div>
      {rightSlot && <div className="shrink-0 flex items-center gap-2">{rightSlot}</div>}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   5. SEGMENTED CONTROLS (NTSegmentedControl)
   ---------------------------------------------------------------------------- */
export interface NTSegmentedOption<T extends string = string> {
  id: T;
  label: React.ReactNode;
}

export interface NTSegmentedControlProps<T extends string = string> {
  options: NTSegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'default' | 'buy-sell';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export function NTSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  variant = 'default',
  size = 'sm',
  fullWidth = false,
  className = '',
}: NTSegmentedControlProps<T>) {
  return (
    <div
      className={`inline-flex items-center bg-[#202630] p-0.5 rounded-lg ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        let activeColorClass = 'bg-[#2B3139] text-[#EAECEF] shadow-xs';
        if (variant === 'buy-sell' && active) {
          activeColorClass =
            opt.id === 'buy' || opt.id === 'long'
              ? 'bg-[#0ECB81] text-white'
              : 'bg-[#F6465D] text-white';
        }

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`${fullWidth ? 'flex-1' : ''} ${
              size === 'sm' ? 'px-3.5 py-1 text-xs' : 'px-4 py-1.5 text-[13px]'
            } rounded-[6px] font-semibold transition-all whitespace-nowrap ${
              active ? activeColorClass : 'text-[#848E9C] hover:text-[#EAECEF]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   6. CARDS (NTCard)
   ---------------------------------------------------------------------------- */
export interface NTCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const NTCard: React.FC<NTCardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const surfaceMap = {
    default: 'bg-[#1E2329] rounded-2xl',
    elevated: 'bg-[#202630] rounded-2xl',
    flat: 'bg-[#181A20] rounded-2xl border border-[#2B3139]/60',
  };

  const paddingMap = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div className={`${surfaceMap[variant]} ${paddingMap[padding]} ${className}`} {...props}>
      {children}
    </div>
  );
};

/* ----------------------------------------------------------------------------
   7. ASSET ROWS (NTAssetRow)
   ---------------------------------------------------------------------------- */
export interface NTAssetRowProps {
  symbol: string;
  name?: string;
  chainBadge?: string;
  tagPill?: React.ReactNode;
  aprText?: string;
  primaryRight?: React.ReactNode;
  secondaryRight?: React.ReactNode;
  changePercent?: number;
  showChangePill?: boolean;
  actionButton?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const NTAssetRow: React.FC<NTAssetRowProps> = ({
  symbol,
  name,
  chainBadge,
  tagPill,
  aprText,
  primaryRight,
  secondaryRight,
  changePercent,
  showChangePill = false,
  actionButton,
  onClick,
  className = '',
}) => {
  const isUp = (changePercent ?? 0) >= 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 py-2.5 transition-colors ${
        onClick ? 'cursor-pointer hover:bg-[#202630]/50 rounded-xl px-1.5 -mx-1.5' : ''
      } ${className}`}
    >
      {/* Left: Coin Icon + Symbol + Subtext */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          <CoinIcon asset={symbol} size="md" />
          {chainBadge && (
            <span className="absolute -bottom-0.5 -right-0.5 px-1 py-[1px] rounded text-[8px] font-bold bg-[#2B3139] text-[#F0B90B] border border-[#181A20] leading-none">
              {chainBadge}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-[#EAECEF] truncate">{symbol}</span>
            {tagPill}
            {aprText && (
              <span className="px-1.5 py-0.5 rounded bg-[#2D2618] text-[#F0B90B] text-[10px] font-semibold shrink-0">
                {aprText}
              </span>
            )}
          </div>
          {name && <div className="text-xs text-[#848E9C] truncate mt-0.5">{name}</div>}
        </div>
      </div>

      {/* Middle / Right: Price or Balance */}
      {(primaryRight !== undefined || secondaryRight !== undefined) && (
        <div className="text-right shrink-0">
          {primaryRight !== undefined && (
            <div className="text-[15px] font-semibold text-[#EAECEF] tabular-nums">{primaryRight}</div>
          )}
          {secondaryRight !== undefined && (
            <div className="text-[11px] text-[#848E9C] tabular-nums mt-0.5">{secondaryRight}</div>
          )}
        </div>
      )}

      {/* Far Right: Percentage Pill or Action Button */}
      {showChangePill && changePercent !== undefined && (
        <div
          className={`nt-pct-pill ${
            changePercent > 0
              ? 'nt-pct-pill-up'
              : changePercent < 0
              ? 'nt-pct-pill-down'
              : 'nt-pct-pill-flat'
          }`}
        >
          {isUp ? '+' : ''}
          {changePercent.toFixed(2)}%
        </div>
      )}
      {actionButton && <div className="shrink-0">{actionButton}</div>}
    </div>
  );
};

/* ----------------------------------------------------------------------------
   8. DROPDOWNS (NTDropdown)
   ---------------------------------------------------------------------------- */
export interface NTDropdownOption<T extends string = string> {
  id: T;
  label: string;
  description?: string;
}

export interface NTDropdownProps<T extends string = string> {
  value: T;
  options: NTDropdownOption<T>[];
  onChange: (value: T) => void;
  prefixLabel?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function NTDropdown<T extends string = string>({
  value,
  options,
  onChange,
  prefixLabel,
  size = 'sm',
  className = '',
}: NTDropdownProps<T>) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.id === value) || options[0];

  const sizeClass =
    size === 'xs'
      ? 'h-7 px-2 text-[11px] rounded-md'
      : size === 'sm'
      ? 'h-8 px-2.5 text-xs rounded-lg'
      : 'h-9 px-3 text-xs rounded-lg';

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center justify-between gap-1.5 bg-[#202630] hover:bg-[#2B3139] text-[#EAECEF] font-semibold transition-colors ${sizeClass}`}
      >
        {prefixLabel && <span className="text-[#848E9C] font-normal">{prefixLabel}</span>}
        <span className="truncate">{current?.label ?? value}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#848E9C] shrink-0" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 min-w-[140px] rounded-xl bg-[#202630] border border-[#2B3139] shadow-2xl py-1 z-50">
            {options.map((opt) => {
              const active = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 hover:bg-[#2B3139] transition-colors ${
                    active ? 'text-[#FCD535] font-semibold' : 'text-[#EAECEF] font-medium'
                  }`}
                >
                  <div>
                    <div>{opt.label}</div>
                    {opt.description && (
                      <div className="text-[10px] text-[#848E9C]">{opt.description}</div>
                    )}
                  </div>
                  {active && <Check className="w-3.5 h-3.5 text-[#FCD535] shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   9. ICON CONTAINERS (NTIconContainer)
   ---------------------------------------------------------------------------- */
export interface NTIconContainerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'header' | 'shortcut' | 'action-tile';
  label?: string;
  badgeDot?: boolean;
  badgeCount?: number;
}

export const NTIconContainer: React.FC<NTIconContainerProps> = ({
  variant = 'header',
  label,
  badgeDot = false,
  badgeCount,
  className = '',
  children,
  ...props
}) => {
  if (variant === 'shortcut' || variant === 'action-tile') {
    return (
      <button
        type="button"
        className={`flex flex-col items-center justify-center gap-1.5 group cursor-pointer active:scale-95 transition-transform ${className}`}
        {...props}
      >
        <div
          className={`${
            variant === 'shortcut' ? 'w-11 h-11 rounded-2xl' : 'w-14 h-12 rounded-2xl'
          } bg-[#202630] group-hover:bg-[#2B3139] flex items-center justify-center text-[#EAECEF] transition-colors relative`}
        >
          {children}
          {badgeDot && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] absolute top-1.5 right-1.5" />
          )}
        </div>
        {label && (
          <span className="text-[11px] font-medium text-[#848E9C] group-hover:text-[#EAECEF] leading-tight text-center truncate max-w-full">
            {label}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630] transition-colors relative shrink-0 ${className}`}
      {...props}
    >
      {children}
      {badgeDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] absolute top-1.5 right-1.5" />
      )}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="px-1 min-w-[14px] h-[14px] rounded-full bg-[#F0B90B] text-[#181A20] text-[9px] font-bold flex items-center justify-center absolute -top-0.5 -right-0.5">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
};

/* ----------------------------------------------------------------------------
   10. BOTTOM SHEETS (NTBottomSheet)
   ---------------------------------------------------------------------------- */
export interface NTBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxHeightClass?: string;
}

export const NTBottomSheet: React.FC<NTBottomSheetProps> = ({
  open,
  onClose,
  title,
  children,
  maxHeightClass = 'max-h-[85dvh]',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="flex-1" onClick={onClose} />
      <div
        className={`w-full max-w-lg mx-auto bg-[#1E2329] rounded-t-3xl flex flex-col overflow-hidden pb-safe-bottom shadow-2xl ${maxHeightClass}`}
      >
        {/* Drag Handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <span className="w-9 h-1 rounded-full bg-[#474D57]" />
        </div>
        {title && (
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#2B3139]/60 shrink-0">
            <h3 className="text-[16px] font-bold text-[#EAECEF]">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]"
              aria-label="Close sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------------------
   11. MODALS & FULL-SCREEN MOBILE VIEWS (NTModal)
   ---------------------------------------------------------------------------- */
export interface NTModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  rightSlot?: React.ReactNode;
  fullScreen?: boolean;
  children: React.ReactNode;
}

export const NTModal: React.FC<NTModalProps> = ({
  open,
  onClose,
  title,
  rightSlot,
  fullScreen = true,
  children,
}) => {
  if (!open) return null;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#181A20] text-[#EAECEF] flex flex-col overflow-hidden pt-safe-top pb-safe-bottom animate-in fade-in duration-150">
        <header className="h-11 px-4 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 -ml-1.5 rounded-lg flex items-center justify-center text-[#EAECEF] hover:bg-[#202630]"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {title && (
            <h2 className="text-[17px] font-semibold text-[#EAECEF] truncate">{title}</h2>
          )}
          <div className="min-w-8 flex items-center justify-end gap-2">{rightSlot}</div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 pb-8">{children}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl bg-[#1E2329] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-[#EAECEF]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#848E9C] hover:text-[#EAECEF]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

/* ----------------------------------------------------------------------------
   12. LOADING STATES (NTLoadingState)
   ---------------------------------------------------------------------------- */
export const NTLoadingState: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 py-2 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#202630]" />
            <div className="space-y-1.5">
              <div className="w-20 h-3.5 rounded bg-[#202630]" />
              <div className="w-14 h-2.5 rounded bg-[#202630]" />
            </div>
          </div>
          <div className="w-16 h-6 rounded-md bg-[#202630]" />
        </div>
      ))}
    </div>
  );
};

/* ----------------------------------------------------------------------------
   13. EMPTY STATES (NTEmptyState)
   Matches reference illustrations (Document search, Wallet funds, Portfolio box)
   ---------------------------------------------------------------------------- */
export interface NTEmptyStateProps {
  variant?: 'orders' | 'wallet' | 'records';
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const NTEmptyState: React.FC<NTEmptyStateProps> = ({
  variant = 'orders',
  title = 'No Open Orders',
  subtitle,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`py-8 px-4 flex flex-col items-center justify-center text-center ${className}`}>
      {/* Reference-style 2-tone muted gray & yellow illustration */}
      <div className="w-14 h-14 mb-2.5 flex items-center justify-center">
        {variant === 'wallet' ? (
          <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
            <rect x="8" y="16" width="44" height="34" rx="6" fill="#2B3139" />
            <path d="M14 16V13C14 10.7909 15.7909 9 18 9H42C44.2091 9 46 10.7909 46 13V16" fill="#333B47" />
            <rect x="38" y="27" width="18" height="12" rx="4" fill="#474D57" />
            <circle cx="44" cy="33" r="2.5" fill="#F0B90B" />
          </svg>
        ) : (
          <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
            <rect x="14" y="10" width="32" height="42" rx="4" fill="#2B3139" />
            <rect x="20" y="18" width="16" height="3" rx="1.5" fill="#474D57" />
            <rect x="20" y="25" width="20" height="3" rx="1.5" fill="#474D57" />
            <rect x="20" y="32" width="12" height="3" rx="1.5" fill="#474D57" />
            <circle cx="42" cy="40" r="9" fill="#333B47" stroke="#181A20" strokeWidth="2" />
            <circle cx="42" cy="40" r="4" fill="#F0B90B" />
            <path d="M48.5 46.5L54 52" stroke="#474D57" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <div className="text-[13px] font-semibold text-[#EAECEF]">{title}</div>
      {subtitle && <div className="text-xs text-[#848E9C] mt-1 max-w-[240px]">{subtitle}</div>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 px-4 py-1.5 rounded-lg bg-[#2B3139] hover:bg-[#333B47] text-xs font-semibold text-[#EAECEF] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/* ----------------------------------------------------------------------------
   14. REFERENCE 2-TONE BOTTOM NAVIGATION ICONS & NEXUSTRADE BRAND EMBLEM
   Matches Reference Recording (00:00 - 02:15) including the circular Swap
   Arrows icon on Trade (without a solid yellow circle background).
   ---------------------------------------------------------------------------- */
export const NTBottomNavIcon: React.FC<{
  tab: 'home' | 'markets' | 'trade' | 'futures' | 'discover' | 'assets';
  active: boolean;
}> = ({ tab, active }) => {
  const primary = active ? '#EAECEF' : '#848E9C';
  const accent = active ? '#F0B90B' : '#848E9C';

  switch (tab) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none">
          <path
            d="M4 10.5L12 4L20 10.5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V10.5Z"
            fill={active ? primary : 'none'}
            stroke={primary}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <rect
            x="9.5"
            y="13.5"
            width="5"
            height="6.5"
            rx="1"
            fill={active ? accent : 'none'}
            stroke={active ? accent : primary}
            strokeWidth="1.6"
          />
        </svg>
      );

    case 'markets':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none">
          <rect x="4" y="12" width="4" height="8" rx="1" fill={active ? primary : 'none'} stroke={primary} strokeWidth="1.7" />
          <rect x="10" y="6" width="4" height="14" rx="1" fill={active ? accent : 'none'} stroke={active ? accent : primary} strokeWidth="1.7" />
          <rect x="16" y="9" width="4" height="11" rx="1" fill={active ? primary : 'none'} stroke={primary} strokeWidth="1.7" />
        </svg>
      );

    case 'trade':
      return (
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px]" fill="none">
          <circle
            cx="12"
            cy="12"
            r="9"
            fill={active ? '#2B3139' : 'none'}
            stroke={primary}
            strokeWidth="1.7"
          />
          <path
            d="M8.5 10H15.5L13.2 7.8"
            stroke={active ? accent : primary}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.5 14H8.5L10.8 16.2"
            stroke={primary}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'futures':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none">
          <path d="M7 4V20" stroke={primary} strokeWidth="1.7" strokeLinecap="round" />
          <rect x="4.5" y="7.5" width="5" height="8" rx="1" fill={active ? primary : '#181A20'} stroke={primary} strokeWidth="1.7" />
          <path d="M17 4V20" stroke={active ? accent : primary} strokeWidth="1.7" strokeLinecap="round" />
          <rect
            x="14.5"
            y="8.5"
            width="5"
            height="7"
            rx="1"
            fill={active ? accent : '#181A20'}
            stroke={active ? accent : primary}
            strokeWidth="1.7"
          />
        </svg>
      );

    case 'discover':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none">
          <circle cx="12" cy="12" r="8.5" stroke={primary} strokeWidth="1.7" />
          <polygon
            points="14.8,9.2 13,13 9.2,14.8 11,11"
            fill={active ? accent : 'none'}
            stroke={active ? accent : primary}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'assets':
      return (
        <svg viewBox="0 0 24 24" className="w-[21px] h-[21px]" fill="none">
          <rect
            x="3.5"
            y="6"
            width="17"
            height="13"
            rx="2.5"
            fill={active ? primary : 'none'}
            stroke={primary}
            strokeWidth="1.7"
          />
          <rect
            x="14"
            y="10.2"
            width="6.5"
            height="4.6"
            rx="1.2"
            fill={active ? accent : '#181A20'}
            stroke={active ? accent : primary}
            strokeWidth="1.5"
          />
        </svg>
      );
  }
};

export const NexusTradeEmblem: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="4" y="4" width="40" height="40" rx="12" fill="#202630" />
    <path
      d="M14 32V16L25.5 28.5V16M34 16V32L22.5 19.5"
      stroke="#FCD535"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="34" cy="16" r="2.5" fill="#0ECB81" />
  </svg>
);

export { ChevronRight };
