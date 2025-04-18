"use client";
import React, { useState, useEffect, useRef } from "react";
import SizedButton from "../../components/SizedButton/SizedButton";
import styles from "./page.module.scss";
import Image from "next/image";
import StatusDropdown from "../../components/StatusDropdown/StatusDropdown";
import CustomButton from "../../components/CustomButton/CustomButton";
import Comment from "../../components/Comment/Comment";
import { useParams, useRouter } from "next/navigation";
import DepartmentsButton from "@/app/components/DepartmentsButton/DepartmentsButton";
import { useTasks } from "../../components/contexts/TaskContext";
import config from "../../Config/Config";

const statusIdMap: { [key: string]: number } = {
  დასაწყები: 1,
  პროგრესში: 2,
  "მზად ტესტირებისთვის": 3,
  დასრულებული: 4,
};

const statusIdToNameMap: { [key: number]: string } = {
  1: "დასაწყები",
  2: "პროგრესში",
  3: "მზად ტესტირებისთვის",
  4: "დასრულებული",
};

const georgianMonths: { [key: number]: string } = {
  1: "იან", // January
  2: "თებ", // February
  3: "მარ", // March
  4: "აპრ", // April
  5: "მაი", // May
  6: "ივნ", // June
  7: "ივლ", // July
  8: "აგვ", // August
  9: "სექ", // September
  10: "ოქტ", // October
  11: "ნოე", // November
  12: "დეკ", // December
};

const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const monthAbbr = georgianMonths[month] || "თვე";
  return `${monthAbbr} - ${day}/${month}/${year}`;
};

export default function TaskDetails() {
  const { id } = useParams();
  const router = useRouter();
  const {
    tasks,
    updateTaskStatus,
    updateTaskComments,
    fetchCommentsForTask,
    clearCommentsForTask,
    loading,
    loadingComments,
    error,
    statuses,
  } = useTasks();

  const taskId = parseInt(id as string);
  const task = tasks.find((t) => t.id === taskId);

  const [statusError, setStatusError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const replyInputRef = useRef<HTMLDivElement>(null);

  // Redirect if task is not found
  useEffect(() => {
    if (!loading && !error && !task) {
      router.push("/");
    }
  }, [loading, error, task, router]);

  // Fetch comments on mount and clear on unmount
  useEffect(() => {
    if (taskId) {
      console.log(`Fetching comments for taskId: ${taskId}`);
      fetchCommentsForTask(taskId);

      return () => {
        console.log(`Clearing comments for taskId: ${taskId}`);
        if (typeof clearCommentsForTask === "function") {
          clearCommentsForTask(taskId);
        } else {
          console.warn("clearCommentsForTask is not available in TaskContext");
        }
      };
    }
  }, [taskId, fetchCommentsForTask, clearCommentsForTask]);

  // Refetch comments on route change (handles Next.js caching)
  useEffect(() => {
    if (taskId) {
      console.log(`Route changed, refetching comments for taskId: ${taskId}`);
      fetchCommentsForTask(taskId);
    }
  }, [taskId, fetchCommentsForTask, router.asPath]);

  // Handle click outside to close reply input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        replyInputRef.current &&
        !replyInputRef.current.contains(event.target as Node)
      ) {
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return null; // Render nothing while redirecting

  const priorityLvl =
    task.priority.name === "Low"
      ? "low"
      : task.priority.name === "Medium"
      ? "medium"
      : task.priority.name === "High"
      ? "high"
      : "low";

  const flattenedComments =
    task.commentDetails?.map((comment) => ({
      id: comment.id || 0,
      name: comment.author_nickname || "Unknown",
      text: comment.text || comment.content || "No content",
      img: comment.author_avatar || "/images/pfp.svg",
      answer: false,
      parent_id: comment.parent_id || null,
      sub_comments: comment.sub_comments || [],
    })) || [];

  // Flatten sub-comments
  const allComments = flattenedComments.reduce(
    (
      acc: {
        id: number;
        name: string;
        text: string;
        img: string;
        answer: boolean;
        parent_id: number | null;
      }[],
      comment
    ) => {
      acc.push({
        id: comment.id,
        name: comment.name,
        text: comment.text,
        img: comment.img,
        answer: false,
        parent_id: null,
      });

      if (comment.sub_comments && comment.sub_comments.length > 0) {
        comment.sub_comments.forEach((subComment: any) => {
          acc.push({
            id: subComment.id || 0,
            name: subComment.author_nickname || "Unknown",
            text: subComment.text || subComment.content || "No content",
            img: subComment.author_avatar || "/images/pfp.svg",
            answer: true,
            parent_id: subComment.parent_id || comment.id,
          });
        });
      }
      return acc;
    },
    []
  );

  const handleStatusChange = async (newStatus: string) => {
    const normalizedStatus = newStatus.trim();
    const serverStatusId = statusIdMap[normalizedStatus];
    if (isNaN(taskId)) {
      console.error(`Invalid task ID: ${id}`);
      setStatusError("Invalid task ID");
      return;
    }
    if (!serverStatusId) {
      console.error(`Invalid status: ${newStatus}`);
      setStatusError("Invalid status selected");
      return;
    }

    const validStatus = statuses.find((status) => status.id === serverStatusId);
    if (!validStatus) {
      console.error(`Status ID ${serverStatusId} does not exist on the server`);
      setStatusError("Selected status is not available");
      return;
    }

    try {
      setStatusError(null);
      await updateTaskStatus(taskId, serverStatusId, normalizedStatus);
    } catch (err: any) {
      setStatusError(`Failed to update status: ${err.message}`);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    if (isNaN(taskId)) return;

    try {
      setCommentError(null);
      const response = await fetch(
        `${config.serverUrl}/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.token}`,
          },
          body: JSON.stringify({
            text: newComment,
            task_id: taskId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to post comment: ${response.status} - ${errorData}`);
      }

      await fetchCommentsForTask(taskId); // Refetch comments from the server
      updateTaskComments(taskId, (task.commentDetails?.length || 0) + 1);
      setNewComment("");
    } catch (err: any) {
      console.error("Error posting comment:", err.message);
      setCommentError(`Failed to post comment: ${err.message}`);
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    if (isNaN(taskId)) return;

    try {
      setCommentError(null);
      const response = await fetch(
        `${config.serverUrl}/tasks/${taskId}/comments`,
        {
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
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to post reply: ${response.status} - ${errorData}`);
      }

      await fetchCommentsForTask(taskId); // Refetch comments from the server
      updateTaskComments(taskId, (task.commentDetails?.length || 0) + 1);
      setReplyText("");
      setReplyingTo(null);
    } catch (err: any) {
      console.error("Error posting reply:", err.message);
      setCommentError(`Failed to post reply: ${err.message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePostComment();
  };

  const handleReplyKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    parentId: number
  ) => {
    if (e.key === "Enter") handlePostReply(parentId);
  };

  return (
    <section className={styles.section}>
      <div className={styles.infoDiv}>
        <div className={styles.lvl}>
          <SizedButton lvl={priorityLvl} size="big" />
          <DepartmentsButton department={task.department} />
        </div>
        <div className={styles.task}>
          <h1>{task.name}</h1>
          <p>{task.description || "No description"}</p>
        </div>
        <div className={styles.taskDetails}>
          <h2>დავალების დეტალები</h2>
          {statusError && <div className={styles.error}>{statusError}</div>}
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
                initialStatus={task.status.name}
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
              {task.employee.avatar ? (
                <img
                  src={task.employee.avatar}
                  className={styles.pfp}
                  width={32}
                  height={32}
                  alt="pfp"
                />
              ) : (
                <div className={styles.pfpPlaceholder} />
              )}
              <div className={styles.employeeInfoText}>
                <p>{task.department.name}</p>
                <p>
                  {task.employee.name} {task.employee.surname}
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
              {task.due_date ? formatDueDate(task.due_date) : "No due date"}
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
            <span>{allComments.length}</span>
          </div>
          {commentError && <div className={styles.error}>{commentError}</div>}
          {loadingComments ? (
            <div>Loading comments...</div>
          ) : allComments.length === 0 ? (
            <div>No comments yet.</div>
          ) : (
            allComments.map((comment) => (
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
            ))
          )}
        </div>
      </div>
    </section>
  );
}