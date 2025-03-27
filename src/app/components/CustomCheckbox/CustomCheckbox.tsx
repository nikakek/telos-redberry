"use client";
import { useState } from "react";
import styles from "./CustomCheckbox.module.scss"
import clsx from "clsx";

type Props = {
    color?: "orange" | "pink" | "blue" | "yellow"
}

function CustomCheckbox(props: Props) {
    let colorName: string;

    const [checked, setChecked] = useState(false);

    return (
        <input
            type="checkbox"
            className={clsx(styles.checkbox, props.color && styles[props.color])}
            checked={checked}
            onChange={() => setChecked(!checked)}
        />
    )
}

export default CustomCheckbox;