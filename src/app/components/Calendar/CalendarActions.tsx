"use client";
import React from "react";
import styles from "./DatePicker.module.css";

interface CalendarActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const CalendarActions: React.FC<CalendarActionsProps> = ({
  onCancel,
  onConfirm,
}) => {
  return (
    <div className={styles.actionBar}>
      <button className={styles.cancelButton} onClick={onCancel}>
        Cancel
      </button>
      <button className={styles.okButton} onClick={onConfirm}>
        OK
      </button>
    </div>
  );
};

export default CalendarActions;
