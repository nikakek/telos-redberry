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
  "დასაწყები": 1,
  "პროგრესში": 2,
  "მზად ტესტირებისთვის": 3,
  "დასრულებული": 4,
};

const statusIdToNameMap: { [key: number]: string } = {
  1: "დასაწყები",
  2: "პროგრესში",
  3: "მზად ტესტირებისთვის",
  4: "დასრულებული",
};

export default function TaskDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { tasks, updateTaskStatus, updateTaskComments, fetchCommentsForTask, loading, error, statuses } = useTasks();

  const taskId = parseInt(id as string);
  const task = tasks.find((t) => t.id === taskId);

  const [commentsLoading, setCommentsLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const hasFetchedComments = useRef(false);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) {
    router.push("/"); // Redirect to main page if task not found
    return null;
  }

  const priorityLvl =
    task.priority.name === "Low"
      ? "low"
      : task.priority.name === "Medium"
      ? "medium"
      : task.priority.name === "High"
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
    const loadComments = async () => {
      if (hasFetchedComments.current) return; // Skip if already fetched
      setCommentsLoading(true);
      await fetchCommentsForTask(taskId);
      setCommentsLoading(false);
      hasFetchedComments.current = true;
    };
    loadComments();
  }, [taskId, fetchCommentsForTask]);

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
            img: subComment.author_avatar || "/images/pfp.svg",
            answer: true,
            parent_id: subComment.parent_id || comment.id,
          });
        });
      }
    });
    return flattened;
  };

  useEffect(() => {
    if (task.commentDetails) {
      setComments(flattenComments(task.commentDetails));
    } else {
      setComments([]);
    }
  }, [task.commentDetails]);

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

    // Validate status_id against available statuses from the server
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

    const response = await fetch(`${config.serverUrl}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}` },
      body: JSON.stringify({
        text: newComment,
        task_id: taskId,
      }),
    });

    if (response.ok) {
      const newPostedComment = await response.json();
      const newCommentId = newPostedComment.id || Date.now();

      const updatedComments = [
        {
          id: newCommentId,
          name: "თქვენ",
          text: newComment,
          img: task.employee.avatar,
          answer: false,
          parent_id: null,
        },
        ...comments,
      ];
      setComments(updatedComments);
      updateTaskComments(taskId, updatedComments.length);
      hasFetchedComments.current = false; // Allow fetching after posting
      await fetchCommentsForTask(taskId);
      setNewComment("");
    } else {
      console.error("Failed to post comment:", await response.text());
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    if (isNaN(taskId)) return;

    const response = await fetch(`${config.serverUrl}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}` },
      body: JSON.stringify({
        text: replyText,
        task_id: taskId,
        parent_id: parentId,
      }),
    });

    if (response.ok) {
      const newPostedReply = await response.json();
      const newReplyId = newPostedReply.id || Date.now();

      const parentIndex = comments.findIndex((comment) => comment.id === parentId);
      if (parentIndex === -1) return;

      const newSubcomment = {
        id: newReplyId,
        name: "თქვენ",
        text: replyText,
        img: task.employee.avatar,
        answer: true,
        parent_id: parentId,
      };

      const updatedComments = [...comments];
      updatedComments.splice(parentIndex + 1, 0, newSubcomment);
      setComments(updatedComments);
      updateTaskComments(taskId, updatedComments.length);
      hasFetchedComments.current = false; // Allow fetching after posting
      await fetchCommentsForTask(taskId);
      setReplyText("");
      setReplyingTo(null);
    } else {
      console.error("Failed to post reply:", await response.text());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePostComment();
  };

  const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, parentId: number) => {
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
              <Image src="/icons/pie-chart.svg" width={24} height={24} alt="chart" />
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
              <Image src="/icons/stickman.svg" width={24} height={24} alt="chart"/>
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
              <Image src="/icons/calendar.svg" width={24} height={24} alt="chart" />
              <p>დავალების ვადა</p>
            </div>
            <div className={styles.date}>
              {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
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
            <span>{comments.length}</span>
          </div>
          {commentsLoading ? (
            <div>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div>No comments yet.</div>
          ) : (
            comments.map((comment) => (
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