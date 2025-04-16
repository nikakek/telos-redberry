"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./PriorityDropdown.module.scss";
import Image from "next/image";
import clsx from "clsx";
import { useTasks } from "../contexts/TaskContext";

interface PriorityDropdownProps {
  onPriorityChange: (newPriority: string) => void;
}

export default function PriorityDropdown({
  onPriorityChange,
}: PriorityDropdownProps) {
  const { priorities } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string>("საშუალო");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onPriorityChange("საშუალო");
  }, []);

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

  const handleSelect = (priorityName: string) => {
    setSelectedPriority(priorityName);
    onPriorityChange(priorityName);
    setIsOpen(false);
  };

  const getPriorityIcon = (priorityName: string) => {
    switch (priorityName.toLowerCase()) {
      case "დაბალი":
        return "/icons/Low.svg";
      case "საშუალო":
        return "/icons/Medium.svg";
      case "მაღალი":
        return "/icons/High.svg";
      default:
        return "/icons/Low.svg";
    }
  };

  return (
    <div
      className={clsx(styles.container, {
        [styles.containerActive]: isOpen,
      })}
      ref={dropdownRef}
    >
      <div
        className={clsx(styles.beforeDrop, {
          [styles.beforeDropOpen]: isOpen,
        })}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedPriority ? (
          <div className={styles.left}>
            <Image
              src={getPriorityIcon(selectedPriority)}
              width={16}
              height={16}
              alt={`${selectedPriority} icon`}
              className={styles.priorityIcon}
            />
            <span>{selectedPriority}</span>
          </div>
        ) : (
          <span>აირჩიეთ პრიორიტეტი</span>
        )}
        <div className={styles.arrow}>
          <Image
            src="../icons/arrowDown.svg"
            width={16}
            height={16}
            alt="Dropdown Arrow"
            className={isOpen ? styles.arrowOpen : ""}
          />
        </div>
      </div>
      {isOpen && (
        <div className={styles.dropdownContent}>
          {priorities.map((priority) => (
            <div
              key={priority.id}
              className={clsx(styles.dropdownItem, {
                [styles.selected]: selectedPriority === priority.name,
              })}
              onClick={() => handleSelect(priority.name)}
            >
              <Image
                src={getPriorityIcon(priority.name)}
                width={16}
                height={16}
                alt={`${priority.name} icon`}
                className={styles.priorityIcon}
              />
              <span>{priority.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
