"use client";
import React from "react";
import styles from "./DatePicker.module.css";

interface CalendarGridProps {
  days: {
    date: number;
    isCurrentMonth: boolean;
    isSelected: boolean;
  }[];
  weekDays: string[];
  onSelectDate: (day: number) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  weekDays,
  onSelectDate,
}) => {
  // Create rows of 7 days each
  const rows = [];
  let cells = [];

  // Add weekday headers
  const weekDayHeaders = (
    <div className={styles.calendarRow}>
      {weekDays.map((day, index) => (
        <div key={index} className={styles.dayHeader}>
          {day}
        </div>
      ))}
    </div>
  );

  // Create calendar grid
  days.forEach((day, index) => {
    if (index % 7 === 0 && cells.length > 0) {
      rows.push(cells);
      cells = [];
    }

    const dayClass = day.isSelected
      ? styles.selectedDay
      : day.isCurrentMonth
      ? styles.dayCell
      : styles.inactiveDay;

    cells.push(
      <div
        key={index}
        className={dayClass}
        onClick={() => day.isCurrentMonth && onSelectDate(day.date)}
      >
        {day.date}
      </div>
    );

    if (index === days.length - 1) {
      rows.push(cells);
    }
  });

  return (
    <section className={styles.calendarGrid}>
      {weekDayHeaders}
      {rows.map((row, index) => (
        <div
          key={index}
          className={
            index === 0 || index === rows.length - 1
              ? styles.inactiveRow
              : styles.calendarRow
          }
        >
          {row}
        </div>
      ))}
    </section>
  );
};

export default CalendarGrid;
