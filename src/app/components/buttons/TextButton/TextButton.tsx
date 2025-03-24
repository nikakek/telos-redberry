import styles from "./TextButton.module.scss";
import clsx from "clsx";
import Image from "next/image";

type Props = {
  text: string;
  img: string;
};

function TextButton(props: Props) {
  return (
    <button className={clsx(styles.button)}>
      <Image src="/icons/reply.svg" alt="" width={16} height={16} />
      {props.text}
    </button>
  );
}

export default TextButton;
