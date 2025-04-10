"use client";
import styles from "./Person.module.scss";
import clsx from "clsx";
import Image from "next/image";
import React from "react";

type Props = {
  text: string;
  onRemove: () => void;
};

function Person(props: Props) {
  return (
    <div className={styles.div}>
      {props.text}
      <Image
        src="/icons/x.svg"
        width={14}
        height={14}
        alt="x"
        onClick={props.onRemove}
      />
    </div>
  );
}

export default Person;