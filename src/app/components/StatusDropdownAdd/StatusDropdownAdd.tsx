"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./StatusDropdownAdd.module.scss";
import Image from "next/image";
import config from "../../Config/Config";

interface Status {
  id: number;
  name: string;
}

interface StatusDropdownAddProps {
  initialStatus: string;
  onStatusChange: (newStatus: string) => void;
}

export default function StatusDropdownAdd({
  initialStatus,
  onStatusChange,
}: StatusDropdownAddProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${config.serverUrl}/statuses`, {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch statuses: ${response.status} ${response.statusText}`
          );
        }
        const data: Status[] = await response.json();
        setStatuses(data);
        const matchedStatus = data.find((s) => s.name === initialStatus);
        if (matchedStatus) {
          setSelectedStatus(matchedStatus.name);
        }
      } catch (err: any) {
        console.error("Error fetching statuses:", err.message);
        setError("Failed to load statuses");
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [initialStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleArrowClick = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (name: string) => {
    setSelectedStatus(name);
    onStatusChange(name);
    setIsOpen(false);
  };

  return (
    <div
      className={`${styles.container} ${isOpen ? styles.containerActive : ""}`}
      ref={dropdownRef}
    >
      <div className={styles.beforeDrop}>
        <div className={styles.left}>
          <span>{selectedStatus}</span>
        </div>
        <div className={styles.arrow} onClick={handleArrowClick}>
          <Image
            src="../icons/arrowDown.svg"
            width={14}
            height={14}
            alt="arrow down"
            className={isOpen ? styles.arrowOpen : ""}
          />
        </div>
      </div>
      {isOpen && (
        <>
          {loading ? (
            <div className={styles.dropdownItem}>Loading...</div>
          ) : error ? (
            <div className={styles.dropdownItem}>{error}</div>
          ) : (
            statuses.map((status) => (
              <div
                key={status.id}
                className={styles.dropdownItem}
                onClick={() => handleOptionClick(status.name)}
              >
                <span>{status.name}</span>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
