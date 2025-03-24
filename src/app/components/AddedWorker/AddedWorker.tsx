import styles from "./AddedWorker.module.scss";
import clsx from "clsx";
import Image from "next/image";


type Props = {
  img: string;
  name: string;
};

let text: string;

function AddedWorker(props: Props) {
  return (
    <div className={styles.div}>
        <Image src={props.img} width={28} height={28} alt='pfp' />
        {props.name}
    </div>
  );
}

export default AddedWorker;
