import React from "react";
import styles from "./Comment.module.scss";
import Image from "next/image";

type Props = {
  img: string | undefined;
  name: string;
  text: string;
  answer: boolean;
  onReplyClick?: () => void;
};

function Comment({ img, name, text, answer, onReplyClick }: Props) {
  return (
    <div className={`${styles.div} ${answer ? styles.reply : ""}`}>
      <div className={styles.img}>
          <img
            src={img}
            width={38}
            height={38}
            alt="pfp"
            className={styles.img}
          />
      </div>
      <div className={styles.content}>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.text}>{text}</p>
        {!answer && onReplyClick && (
          <button className={styles.replyButton} onClick={onReplyClick}>
            <img src="/icons/reply.svg" alt="answerArrow" /><span>უპასუხე</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default Comment;