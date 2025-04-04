"use client";
import styles from "./CustomCheckbox.module.scss";
import clsx from "clsx";

type Props = {
  color?: "orange" | "pink" | "blue" | "yellow";
  checked?: boolean;
  onChange?: () => void;
};

function CustomCheckbox(props: Props) {
  return (
    <input
      type="checkbox"
      className={clsx(styles.checkbox, props.color && styles[props.color])}
      checked={props.checked}
      onChange={props.onChange}
    />
  );
}

export default CustomCheckbox;
