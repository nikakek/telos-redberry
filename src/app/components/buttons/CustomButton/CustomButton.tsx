import styles from "./CustomButton.module.scss";
import clsx from "clsx";

type Props = {
  text: string;
  background: "background" | "outline";
  border: "squared" | "rounded";
  color?: "primary" | "secondary";	
};

function CustomButton(props: Props) {
  return (
    <button
      className={clsx(
        styles.button,
        styles[props.background],
        styles[props.border]
      )}
    >
      {props.text}
    </button>
  )
}

export default CustomButton;
