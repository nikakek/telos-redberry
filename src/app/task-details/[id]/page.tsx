// src/app/task-details/[id]/page.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import SizedButton from "../../components/SizedButton/SizedButton";
import styles from "./page.module.scss";
import Image from "next/image";
import StatusDropdown from "../../components/StatusDropdown/StatusDropdown";
import CustomButton from "../../components/CustomButton/CustomButton";
import Comment from "../../components/Comment/Comment";
import { useSearchParams, useParams } from "next/navigation";
import config from "../../Config/Config";
import DepartmentsButton from "@/app/components/DepartmentsButton/DepartmentsButton";
import Header from "@/app/components/Header/Header";
import { useTasks } from "../../components/contexts/TaskContext";

const statusIdMap: { [key: string]: number } = {
  "დასაწყები": 1, // "To Do"
  "პროგრესში": 2, // "In Progress"
  "მზად ტესტირებისთვის": 3, // "Ready for Testing"
  "დასრულებული": 4, // "Done"
};

// Map status IDs back to Georgian status names for the UI
const statusIdToNameMap: { [key: number]: string } = {
  1: "დასაწყები",
  2: "პროგრესში",
  3: "მზად ტესტირებისთვის",
  4: "დასრულებული",
};

export default function TaskDetails() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const { updateTaskStatus, updateTaskComments } = useTasks();

  const taskName = decodeURIComponent(searchParams.get("taskName") || "");
  const taskDescription = decodeURIComponent(searchParams.get("taskDescription") || "");
  const taskDueDate = decodeURIComponent(searchParams.get("taskDueDate") || "");
  const taskEmployeeName = decodeURIComponent(searchParams.get("taskEmployeeName") || "");
  const taskEmployeeSurname = decodeURIComponent(searchParams.get("taskEmployeeSurname") || "");
  const taskEmployeeAvatar = decodeURIComponent(searchParams.get("taskEmployeeAvatar") || "");
  const taskPriorityName = decodeURIComponent(searchParams.get("taskPriorityName") || "");
  const taskStatusName = decodeURIComponent(searchParams.get("taskStatusName") || "");
  const taskDepartmentName = decodeURIComponent(searchParams.get("taskDepartmentName") || "");
  const taskDepartmentId = parseInt(searchParams.get("taskDepartmentId") || "0");

  const taskDepartment = { id: taskDepartmentId, name: taskDepartmentName };
  const priorityLvl =
    taskPriorityName.toLowerCase() === "დაბალი"
      ? "low"
      : taskPriorityName.toLowerCase() === "საშუალო"
      ? "medium"
      : taskPriorityName.toLowerCase() === "მაღალი"
      ? "high"
      : "low";

  const [comments, setComments] = useState<
    { id: number; name: string; text: string; img: string | undefined; answer: boolean; parent_id: number | null }[]
  >([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const replyInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (replyInputRef.current && !replyInputRef.current.contains(event.target as Node)) {
        setReplyingTo(null);
        setReplyText("");
      }
    };

    if (replyingTo !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [replyingTo]);

  const flattenComments = (commentsData: any[]) => {
    const flattened: { id: number; name: string; text: string; img: string; answer: boolean; parent_id: number | null }[] = [];
    commentsData.forEach((comment) => {
      flattened.push({
        id: comment.id || 0,
        name: comment.author_nickname || "Unknown",
        text: comment.text || comment.content || "No content",
        img: comment.author_avatar || "/images/pfp.svg",
        answer: false,
        parent_id: comment.parent_id || null,
      });

      if (comment.sub_comments && comment.sub_comments.length > 0) {
        comment.sub_comments.forEach((subComment: any) => {
          flattened.push({
            id: subComment.id || 0,
            name: subComment.author_nickname || "Unknown",
            text: subComment.text || subComment.content || "No content",
            img: subComment.author_avatar,
            answer: true,
            parent_id: subComment.parent_id || comment.id,
          });
        });
      }
    });
    return flattened;
  };

  useEffect(() => {
    const fetchComments = async () => {
      const response = await fetch(`${config.serverUrl}/tasks/${id}/comments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
      });

      if (response.ok) {
        const commentsData = await response.json();
        setComments(flattenComments(commentsData));
      }
    };

    fetchComments();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    const normalizedStatus = newStatus.trim();
    const serverStatusId = statusIdMap[normalizedStatus];
    console.log(`handleStatusChange called with newStatus: ${normalizedStatus}, serverStatusId: ${serverStatusId}`);
    console.log(`Request URL: ${config.serverUrl}/tasks/${id}`);
    console.log(`Request Body:`, JSON.stringify({ status_id: serverStatusId }));
    const taskId = parseInt(id as string);
    if (isNaN(taskId)) {
      console.error(`Invalid task ID: ${id}`);
      return;
    }

    const response = await fetch(`${config.serverUrl}/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({ status_id: serverStatusId }),
    });

    if (response.ok) {
      const updatedTask = await response.json();
      const serverReturnedStatusId = updatedTask.status?.id || serverStatusId;
      const contextStatus = statusIdToNameMap[serverReturnedStatusId] || normalizedStatus;
      console.log(`Server returned status_id: ${serverReturnedStatusId}, mapped to: ${contextStatus}`);
      updateTaskStatus(taskId, contextStatus);
    } else {
      const errorText = await response.text();
      updateTaskStatus(taskId, normalizedStatus);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    const taskId = parseInt(id as string);
    if (isNaN(taskId)) return;

    const response = await fetch(`${config.serverUrl}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        text: newComment,
        task_id: taskId,
      }),
    });

    if (response.ok) {
      const newPostedComment = await response.json();
      const newCommentId = newPostedComment.id || Date.now();

      setComments((prev) => {
        const updatedComments = [
          {
            id: newCommentId,
            name: "თქვენ",
            text: newComment,
            img: taskEmployeeAvatar,
            answer: false,
            parent_id: null,
          },
          ...prev,
        ];
        updateTaskComments(taskId, updatedComments.length);
        return updatedComments;
      });
      setNewComment("");
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    const taskId = parseInt(id as string);
    if (isNaN(taskId)) return;

    const response = await fetch(`${config.serverUrl}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        text: replyText,
        task_id: taskId,
        parent_id: parentId,
      }),
    });

    if (response.ok) {
      const newPostedReply = await response.json();
      const newReplyId = newPostedReply.id || Date.now();

      setComments((prev) => {
        const parentIndex = prev.findIndex((comment) => comment.id === parentId);
        if (parentIndex === -1) return prev;

        const newSubcomment = {
          id: newReplyId,
          name: "თქვენ",
          text: replyText,
          img: taskEmployeeAvatar,
          answer: true,
          parent_id: parentId,
        };

        const updatedComments = [...prev];
        updatedComments.splice(parentIndex + 1, 0, newSubcomment);
        updateTaskComments(taskId, updatedComments.length);
        return updatedComments;
      });

      setReplyText("");
      setReplyingTo(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePostComment();
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, parentId: number) => {
    if (e.key === "Enter") handlePostReply(parentId);
  };

  return (
    <>
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
                <Image src="/icons/pie-chart.svg" width={24} height={24} alt="chart" />
                <p>სტატუსი</p>
              </div>
              <div className={styles.block}>
                <StatusDropdown initialStatus={taskStatusName} onStatusChange={handleStatusChange} />
              </div>
            </div>
            <div className={styles.employee}>
              <div className={styles.stats}>
                <Image src="/icons/stickman.svg" width={24} height={24} alt="chart" />
                <p>თანამშრომელი</p>
              </div>
              <div className={styles.employeeInfo}>
                {taskEmployeeAvatar ? (
                  <img
                    src={taskEmployeeAvatar}
                    className={styles.pfp}
                    width={32}
                    height={32}
                    alt="pfp"
                  />
                ) : (
                  <div className={styles.pfpPlaceholder} />
                )}
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
                <Image src="/icons/calendar.svg" width={24} height={24} alt="chart" />
                <p>დავალების ვადა</p>
              </div>
              <div className={styles.date}>{new Date(taskDueDate).toLocaleDateString()}</div>
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
              onKeyDown={handleKeyDown}
            />
            <div className={styles.button}>
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
              <div key={comment.id} className={styles.comment}>
                <Comment
                  img={comment.img}
                  name={comment.name}
                  text={comment.text}
                  answer={comment.answer}
                  onReplyClick={() => setReplyingTo(comment.id)}
                />
                {replyingTo === comment.id && (
                  <div className={styles.addComment} ref={replyInputRef}>
                    <input
                      type="text"
                      placeholder="დაწერე პასუხი"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => handleReplyKeyDown(e, comment.id)}
                    />
                    <div className={styles.button}>
                      <CustomButton
                        background="background"
                        text="პასუხი"
                        border="rounded"
                        onClick={() => handlePostReply(comment.id)}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}