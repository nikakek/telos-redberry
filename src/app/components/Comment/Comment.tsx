import AnswerButton from "../AnswerButton/AnswerButton";
import styles from "./Comment.module.scss";
import Image from "next/image";

type Props = {
  img: string;
  name: string;
  text: string;
  answer?: boolean;
};

function Comment(props: Props) {
  return (
    <div className={styles.div}>
      <div className={styles.img}>
        <Image src={props.img} width={38} height={38} alt="pfp" />
      </div>
      <div className={styles.content}>
        <h1 className={styles.name}>{props.name}</h1>
        <p className={styles.text}>{props.text}</p>
          <div className={styles.answer}>
            <AnswerButton text="უპასუხე" />
          </div>
        
      </div>
    </div>
  );
}

export default Comment;