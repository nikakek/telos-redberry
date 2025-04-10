"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./StatusDropdown.module.scss";
import clsx from "clsx";

interface StatusDropdownProps {
  initialStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const statusOptions = ["დასაწყები", "პროგრესში", "მზად ტესტირებისთვის", "დასრულებული"];

export default function StatusDropdown({ initialStatus, onStatusChange }: StatusDropdownProps) {
  const [selected, setSelected] = useState(initialStatus);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (status: string) => {
    setSelected(status);
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div className={clsx(styles.container, { [styles.border]: isOpen })} ref={dropdownRef}>
      <div className={styles.button} onClick={() => setIsOpen(!isOpen)}>
        <p>{selected}</p>
      </div>
      <div className={clsx(styles.dropdown, { [styles.clicked]: !isOpen })}>
        {statusOptions.map((status) => (
          <p key={status} onClick={() => handleSelect(status)}>
            {status}
          </p>
        ))}
      </div>
    </div>
  );
}