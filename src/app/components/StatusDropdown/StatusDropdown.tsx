"use client"
import { useState } from "react";
import styles from "./StatusDropdown.module.scss";
import clsx from "clsx";

function StatusDropdown() {
  const [selected, setSelected] = useState("დასაწყები");
  const [clicked, setClicked] = useState(false);

  return (
    <div className={clsx(styles.container, {[styles.border]: clicked})}>
      <div className={styles.button} onClick={() => {setSelected(selected); setClicked(!clicked)}}>
        <p>{selected}</p>
      </div>
      <div className={clsx(styles.dropdown, {[styles.clicked]: !clicked})}>
        {["დასაწყები", "პროგრესში", "მზად ტესტირებისთვის", "დასრულებული"].map((status) => (
          <p key={status} onClick={() => setSelected(status)}>
            {status}
          </p>
        ))}
      </div>
    </div>
  );
}

export default StatusDropdown;
