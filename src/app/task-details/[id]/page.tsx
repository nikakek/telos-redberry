"use client";
import React, { useState, useEffect } from "react";
import SizedButton from "../../components/SizedButton/SizedButton";
import styles from "./page.module.scss";
import Image from "next/image";
import StatusDropdown from "../../components/StatusDropdown/StatusDropdown";
import CustomButton from "../../components/CustomButton/CustomButton";
import Comment from "../../components/Comment/Comment";
import { useSearchParams, useParams } from "next/navigation";
import config from "../../Config/Config";
import DepartmentsButton from "@/app/components/DepartmentsButton/DepartmentsButton";

export default function TaskDetails() {
  const { id } = useParams();
  const searchParams = useSearchParams();

  const taskName = decodeURIComponent(searchParams.get("taskName") || "");
  const taskDescription = decodeURIComponent(
    searchParams.get("taskDescription") || ""
  );
  const taskDueDate = decodeURIComponent(searchParams.get("taskDueDate") || "");
  const taskEmployeeName = decodeURIComponent(
    searchParams.get("taskEmployeeName") || ""
  );
  const taskEmployeeSurname = decodeURIComponent(
    searchParams.get("taskEmployeeSurname") || ""
  );
  const taskEmployeeAvatar = decodeURIComponent(
    searchParams.get("taskEmployeeAvatar") || ""
  );
  const taskPriorityName = decodeURIComponent(
    searchParams.get("taskPriorityName") || ""
  );
  const taskStatusName = decodeURIComponent(
    searchParams.get("taskStatusName") || ""
  );
  const taskDepartmentName = decodeURIComponent(
    searchParams.get("taskDepartmentName") || ""
  );
  const taskDepartmentId = parseInt(
    searchParams.get("taskDepartmentId") || "0"
  );

  const taskDepartment = {
    id: taskDepartmentId,
    name: taskDepartmentName,
  };
  const priorityLvl =
    taskPriorityName.toLowerCase() === "დაბალი"
      ? "low"
      : taskPriorityName.toLowerCase() === "საშუალო"
      ? "medium"
      : taskPriorityName.toLowerCase() === "მაღალი"
      ? "high"
      : "low";

  const [comments, setComments] = useState<
    { id: number; name: string; text: string; img: string; answer: boolean }[]
  >([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        console.log("Fetching comments for task ID:", id);
        console.log("Using token:", config.token);

        const response = await fetch(
          `https://momentum.redberryinternship.ge/api/tasks/${id}/comments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.token}`,
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch comments: ${response.status} - ${errorText}`);
        }

        const commentsData = await response.json();
        console.log("Raw API response:", commentsData);

        const mappedComments = commentsData.map((comment) => {
          console.log("Processing comment:", comment);
          return {
            id: comment.id || 0,
            name: comment.author_nickname || "Unknown", 
            text: comment.text || comment.content || "No content",
            img: comment.image || comment.avatar || comment.author?.avatar || "https://via.placeholder.com/38",
            answer: comment.is_reply || comment.reply || comment.is_answer || false,
          };
        });

        console.log("Mapped comments:", mappedComments);
        setComments(mappedComments);
      } catch (error) {
        console.error("Error fetching comments:", error.message);
      }
    };

    fetchComments();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`${config.serverUrl}/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({ status: { name: newStatus } }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      console.log(`Status updated to ${newStatus} for task ${id}`);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(
        `https://momentum.redberryinternship.ge/api/tasks/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.token}`,
          },
          body: JSON.stringify({
            content: newComment,
            task_id: parseInt(id),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const newPostedComment = await response.json();

      setComments((prev) => [
        ...prev,
        {
          id: newPostedComment.id,
          name: "თქვენ", // "You" in Georgian
          text: newComment,
          img: taskEmployeeAvatar || "https://via.placeholder.com/38",
          answer: false,
        },
      ]);

      setNewComment("");
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.infoDiv}>
        <div className={styles.lvl}>
          <SizedButton lvl={priorityLvl} size="big" />
          <DepartmentsButton department={taskDepartment} />
        </div>
        <div className={styles.task}>
          <h1>{taskName}</h1>
          <p>{taskDescription}</p>
        </div>
        <div className={styles.taskDetails}>
          <h2>დავალების დეტალები</h2>

          <div className={styles.status}>
            <div className={styles.stats}>
              <Image
                src="/icons/pie-chart.svg"
                width={24}
                height={24}
                alt="chart"
              />
              <p>სტატუსი</p>
            </div>
            <div className={styles.block}>
              <StatusDropdown
                initialStatus={taskStatusName}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>

          <div className={styles.employee}>
            <div className={styles.stats}>
              <Image
                src="/icons/stickman.svg"
                width={24}
                height={24}
                alt="chart"
              />
              <p>თანამშრომელი</p>
            </div>
            <div className={styles.employeeInfo}>
              <Image
                src={taskEmployeeAvatar || "https://via.placeholder.com/32"}
                className={styles.pfp}
                width={32}
                height={32}
                alt="pfp"
              />
              <div className={styles.employeeInfoText}>
                <p>{taskDepartmentName}</p>
                <p>
                  {taskEmployeeName} {taskEmployeeSurname}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.deadline}>
            <div className={styles.stats}>
              <Image
                src="/icons/calendar.svg"
                width={24}
                height={24}
                alt="chart"
              />
              <p>დავალების ვადა</p>
            </div>
            <div className={styles.date}>
              {new Date(taskDueDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.commentsDiv}>
        <div className={styles.addComment}>
          <input
            type="text"
            placeholder="დაწერე კომენტარი"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div>
            <CustomButton
              background="background"
              text="დააკომენტარე"
              border="rounded"
              onClick={handlePostComment}
            />
          </div>
        </div>

        <div className={styles.comments}>
          <div className={styles.commentsCounter}>
            <h2>კომენტარები</h2>
            <span>{comments.length}</span>
          </div>

          {comments.map((comment) => (
            <div className={styles.comment} key={comment.id}>
              <Comment
                img={comment.img}
                name={comment.name}
                text={comment.text}
                answer={comment.answer}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}