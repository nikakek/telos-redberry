"use client";
import { useState } from "react";
import styles from "./CoWorker.module.scss";
import Image from "next/image";
import clsx from "clsx";

function CoWorker() {
    const [isActive, setIsActive] = useState(false);

    const handleClick = () => {
        setIsActive(!isActive);
    };

    return (
        <div 
            className={clsx(styles.div, { [styles.active]: isActive })} 
            onClick={handleClick}
        >
            <h3>თანამშრომელი</h3>
            <Image src="/icons/arrowDown.svg" width={14} height={8} alt="arrow" className={styles.image} />
        </div>
    )
}

export default CoWorker;