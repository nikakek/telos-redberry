import styles from "./Person.module.scss";
import clsx from "clsx";
import Image from "next/image";

type Props = {
    text: string;
}

function Person(props: Props) {

    return (
        <div className={styles.div}>
            {props.text}
            <Image  src="/icons/x.svg" width={14} height={14} alt="x"/>
        </div>
    )
}

export default  Person;