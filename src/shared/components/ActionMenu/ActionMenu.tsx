"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import Button from "@/shared/components/Button/Button";
import styles from "@/shared/components/ActionMenu/ActionMenu.module.scss";

export type ActionMenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type ActionMenuProps = {
  items: ActionMenuItem[];
  ariaLabel?: string;
};

export default function ActionMenu({
  items,
  ariaLabel = "More actions",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        wrapperRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const dropdown = dropdownRef.current;
    if (!button || !dropdown) return;
    const rect = button.getBoundingClientRect();
    const dropdownWidth = dropdown.offsetWidth;
    const dropdownHeight = dropdown.offsetHeight;
    const padding = 8;
    const maxLeft = window.innerWidth - dropdownWidth - padding;
    const maxTop = window.innerHeight - dropdownHeight - padding;
    const left = Math.min(
      Math.max(padding, rect.right - dropdownWidth),
      maxLeft
    );
    const top = Math.min(rect.bottom + padding, maxTop);
    setDropdownStyle({ top, left });
  }, [open, items.length]);

  return (
    <div className={styles.menu} ref={wrapperRef}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={ariaLabel}
        ref={buttonRef}
      >
        ⋯
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className={styles.menuDropdown}
              ref={dropdownRef}
              style={
                dropdownStyle
                  ? { top: dropdownStyle.top, left: dropdownStyle.left }
                  : undefined
              }
            >
              {items.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={styles.menuItem}
                >
                  {item.label}
                </Button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
