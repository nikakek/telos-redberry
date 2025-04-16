"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./StatusDropdown.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useTasks } from "../contexts/TaskContext";

interface StatusDropdownProps {
  initialStatus: string;
  onStatusChange: (newStatus: string) => void;
}

function StatusDropdown({
  initialStatus,
  onStatusChange,
}: StatusDropdownProps) {
  const { statuses } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("Statuses:", statuses);
    console.log("Initial Status:", initialStatus);
  }, [statuses, initialStatus]);

  // Sync selectedStatus with initialStatus only on mount or when initialStatus changes
  useEffect(() => {
    if (typeof initialStatus === "string") {
      setSelectedStatus(initialStatus);
    } else {
      console.warn("initialStatus is not a string:", initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (statusName: string) => {
    if (statusName === selectedStatus) {
      // Avoid unnecessary updates if the selected status hasn't changed
      setIsOpen(false);
      return;
    }

    setSelectedStatus(statusName);
    if (typeof onStatusChange === "function") {
      onStatusChange(statusName);
    } else {
      console.error("onStatusChange is not a function:", onStatusChange);
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      <div
        className={clsx(styles.dropdown, { [styles.active]: isOpen })}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedStatus || "აირჩიეთ სტატუსი"}</span>
        <Image
          src="../icons/arrowDown.svg"
          width={16}
          height={16}
          alt="Dropdown Arrow"
          className={isOpen ? styles.arrowOpen : styles.arrowLocked}
        />
      </div>
      {isOpen && (
        <div
          className={clsx(styles.dropdownContent, { [styles.active]: isOpen })}
        >
          {Array.isArray(statuses) && statuses.length > 0 ? (
            statuses.map((stat) => (
              <div
                key={stat.id}
                className={clsx(styles.dropdownItem, {
                  [styles.selected]: selectedStatus === stat.name,
                })}
                onClick={() => handleSelect(stat.name)}
              >
                {stat.name}
              </div>
            ))
          ) : (
            <div className={styles.dropdownItem}>No statuses available</div>
          )}
        </div>
      )}
    </div>
  );
}

export default StatusDropdown;
