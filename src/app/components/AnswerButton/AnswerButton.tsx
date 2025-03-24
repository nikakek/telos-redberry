import clsx from "clsx";
import Image from "next/image";
import styles from "./AnswerButton.module.scss"

type Props = {
  text: string;
  img: string;
};

function AnswerButton(props: Props) {
  return (
    <button className={clsx(styles.button)}>
      <Image src="/icons/reply.svg" alt="" width={16} height={16} />
      {props.text}
    </button>
  );
}

export default AnswerButton;
