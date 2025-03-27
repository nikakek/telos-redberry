"use client";
import styles from "./Dropdown.module.scss";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import AddedWorker from "../AddedWorker/AddedWorker";
import AddWorker from "../AddWorker/AddWorker";

type Props = {
  text: string;
  min: number;
  max: number;
};

function Dropdown({ text, min, max }: Props) {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getTextColor = (condition: boolean) => {
    if (value === "") return styles.grayText;
    return condition ? styles.greenText : styles.redText;
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={styles.dropdownContainer}>
      <div>
        <h1 className={styles.h1}>{text}</h1>
        <label className={styles.label} htmlFor="dropdownInput">
          <div className={clsx(styles.inputContainer, { [styles.open]: isOpen })}>
            <input
              type="text"
              id="dropdownInput"
              className={styles.inputNoBorder}
              minLength={min}
              maxLength={max}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className={styles.iconWrapper} onClick={toggleDropdown}>
              <Image
                src="/icons/arrowDown.svg"
                width={14}
                height={8}
                alt="arrow"
                className={clsx(styles.icon, { [styles.rotated]: isOpen })}
              />
            </div>
          </div>
        </label>
        <div className={styles.helperTextDiv}>
        <p className={clsx(styles.helperText, getTextColor(value.length >= min))}>
        ✓ მინიმუმ {min} სიმბოლო
        </p>
        <p className={clsx(styles.helperText, getTextColor(value.length <= max))}>
        ✓ მაქსიმუმ {max} სიმბოლო
        </p>
        </div>
        
        <div className={clsx(styles.dropdownContent, { [styles.open]: isOpen })}>
          <AddWorker />
          <AddedWorker img="./images/pfp.svg" name="gela" />
          <AddedWorker img="./images/pfp.svg" name="gela" />
          <AddedWorker img="./images/pfp.svg" name="gela" />
          <AddedWorker img="./images/pfp.svg" name="gela" />
          <AddedWorker img="./images/pfp.svg" name="gela" />
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
