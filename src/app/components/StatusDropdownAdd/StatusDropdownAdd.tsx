"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./StatusDropdownAdd.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useTasks } from "../contexts/TaskContext";

interface StatusDropdownAddProps {
  initialStatus: string;
  onStatusChange: (newStatus: string) => void;
}

function StatusDropdownAdd({
  initialStatus,
  onStatusChange,
}: StatusDropdownAddProps) {
  const { statuses } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setSelectedStatus(statusName);
    onStatusChange(statusName);
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
        <div className={styles.dropdownContent}>
          {statuses.map((stat) => (
            <div
              key={stat.id}
              className={clsx(styles.dropdownItem, {
                [styles.selected]: selectedStatus === stat.name,
              })}
              onClick={() => handleSelect(stat.name)}
            >
              {stat.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusDropdownAdd;
