import styles from "./ColoredButton.module.scss";
import clsx from "clsx";

type Props = {
  color: "pink" | "orange" | "blue" | "yellow";
};

let text: string;

function ColoredButton(props: Props) {
  let text: string;
  switch (props.color) {
    case "pink":
      text = "დიზაინი";
      break;
    case "orange":
      text = "მარკეტინგი";
      break;
    case "blue":
      text = "ლოჯისტიკა";
      break;
    case "yellow":
      text = "ინფ. ტექ.";
      break;

    default:
      text = "button";
  }

  return (
    <button className={clsx(styles.button, styles[props.color])}>{text}</button>
  );
}

export default ColoredButton;
