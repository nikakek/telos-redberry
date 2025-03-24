import styles from "./AddWorker.module.scss";
import clsx from "clsx";
import Image from "next/image";
 

function AddWorker() {
  return (
    <div className={styles.div}>
        <Image src="/icons/plus.svg" width={18} height={18} alt='+' />
        დაამატე თანამშრომელი
    </div>
  )
}

export default AddWorker;
