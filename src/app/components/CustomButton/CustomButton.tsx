"use client";
import styles from "./CustomButton.module.scss";

type Props = {
  border: "rounded" | "square";
  text: string;
  background: "background" | "outline";
  onClick?: () => void;
};

function CustomButton({ border, text, background, onClick }: Props) {
  return (
    <button
      className={`${styles.button} ${styles[border]} ${styles[background]}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default CustomButton;
