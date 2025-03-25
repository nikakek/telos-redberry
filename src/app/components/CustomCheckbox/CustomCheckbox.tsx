"use client";

import { useState } from "react";
import styles from "./CustomCheckbox.module.scss"

type Props = {
    color: "purple" | "grey" | "orange" | "pink" | "blue" | "yellow"
}

function PersonCheckbox(props: Props) {
    const [checked, setChecked] = useState(false);

    return (
        <input
      type="checkbox"
      className={styles.checkbox}
      checked={checked}
      onChange={() => setChecked(!checked)}
    />
    )
}

export default PersonCheckbox;