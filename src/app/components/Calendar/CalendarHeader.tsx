"use client";
import React from "react";
import styles from "./DatePicker.module.css";

interface CalendarHeaderProps {
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <header className={styles.calendarHeader}>
      <div className={styles.monthDisplay}>
        <span className={styles.monthText}>{currentMonth}</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/a1fba4a030e71f570da9b4f8420183f2c45a03ce?placeholderIfAbsent=true&apiKey=4842f4b6cd0f4dd2874a8151479bb22a"
          className={styles.monthIcon}
          alt="Month dropdown"
        />
      </div>
      <div className={styles.navigationButtons}>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/588e0df6c75ad7fc1db25febc21878507380346f?placeholderIfAbsent=true&apiKey=4842f4b6cd0f4dd2874a8151479bb22a"
          className={styles.prevButton}
          alt="Previous month"
          onClick={onPrevMonth}
        />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/12594160453c9e10e88cc44794668682ac279974?placeholderIfAbsent=true&apiKey=4842f4b6cd0f4dd2874a8151479bb22a"
          className={styles.nextButton}
          alt="Next month"
          onClick={onNextMonth}
        />
      </div>
    </header>
  );
};

export default CalendarHeader;
