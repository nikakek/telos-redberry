"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./PriorityDropdown.module.scss";
import Image from "next/image";

export default function PriorityDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState({
    name: "საშუალო",
    icon: "../icons/Medium.svg",
  });
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (name: string, icon: string) => {
    setSelectedPriority({ name, icon });
    setIsOpen(false);
  };

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.containerActive : ""}`}
      ref={dropdownRef}
    >
      <div className={styles.beforeDrop}>
        <div className={styles.left}>
          <Image
            src={selectedPriority.icon}
            width={16}
            height={18}
            alt={selectedPriority.name}
          />
          <span>{selectedPriority.name}</span>
        </div>
        <div className={styles.arrow} onClick={handleArrowClick}>
          <Image
            src="../icons/arrowDown.svg"
            width={14}
            height={14}
            alt="arrow down"
            className={isOpen ? styles.arrowOpen : ""}
          />
        </div>
      </div>
      {isOpen && (
        <>
          <div
            className={styles.dropdownItem}
            onClick={() => handleOptionClick("დაბალი", "../icons/Low.svg")}
          >
            <Image src="../icons/Low.svg" width={16} height={18} alt="low" />
            <span>დაბალი</span>
          </div>
          <div
            className={styles.dropdownItem}
            onClick={() => handleOptionClick("საშუალო", "../icons/Medium.svg")}
          >
            <Image
              src="../icons/Medium.svg"
              width={16}
              height={18}
              alt="medium"
            />
            <span>საშუალო</span>
          </div>
          <div
            className={styles.dropdownItem}
            onClick={() => handleOptionClick("მაღალი", "../icons/High.svg")}
          >
            <Image src="../icons/High.svg" width={16} height={18} alt="high" />
            <span>მაღალი</span>
          </div>
        </>
      )}
    </div>
  );
}
