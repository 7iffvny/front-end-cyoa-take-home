import React, { useEffect, useState } from "react";
import { Api } from "../../../src/api";
import Alert from "./Alert";
import "../styling/CommentList.css";
import "../styling/alert.css";

interface Comment {
  id: number;
  name: string;
  message: string;
  created: string;
}

const CommentList: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success";
  } | null>(null);

  useEffect(() => {
    fetchComments();
    const eventSource = new EventSource("http://localhost:3001/events");
    eventSource.onmessage = (event) => {
      try {
        const newComment: Comment = JSON.parse(event.data);
        setComments((prevComments) => {
          if (prevComments.some((comment) => comment.id === newComment.id)) {
            return prevComments;
          }
          return [newComment, ...prevComments];
        });
      } catch {
        setError("Error parsing message");
      }
    };

    eventSource.onerror = () => {
      setError("Error with connection");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const fetchComments = async () => {
    const response = await Api.get("http://localhost:3001/getComments");
    const fetchedComments = Array.isArray(response) ? response : [];
    // sort comments from newest to oldest
    fetchedComments.sort(
      (a: Comment, b: Comment) =>
        new Date(b.created).getTime() - new Date(a.created).getTime()
    );
    setComments(fetchedComments);
  };

  const handleDelete = async (id: number) => {
    await Api.delete(`http://localhost:3001/deleteComment/${id}`);
    setComments(comments.filter((comment) => comment.id !== id));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() === "" || message.trim() === "") {
      setError("Name and/or message cannot be empty");
      return;
    }

    const response = await Api.post("http://localhost:3001/createComment", {
      name,
      message,
    });

    if (response && response.id) {
      const newComment: Comment = {
        id: response.id,
        name,
        message,
        created: new Date().toISOString(),
      };

      setComments((prevComments) => [newComment, ...prevComments]);
      setName("");
      setMessage("");
      setAlert({ message: `New comment by ${name}!`, type: "success" });
    }
  };

  const handleAlertClose = () => {
    setAlert(null);
  };

  return (
    <div className="entireContainer">
      {/* Comment Form */}
      <div className="commentFormContainer">
        <h2 className="commentsHeaderForm">Add Your Feedback</h2>
        <form className="commentForm" onSubmit={handleAddComment}>
          <input
            type="text"
            className="commentInput"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="commentTextarea"
            placeholder="Your comment"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit" className="commentButton">
            Add Comment
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="commentsListContainer">
        <h2 className="commentsHeaderComment">Comments</h2>
        {error && <p className="errorText">{error}</p>}
        {alert && (
          <div id="liveAlert">
            <Alert
              message={alert.message}
              type={alert.type}
              onClose={handleAlertClose}
            />
          </div>
        )}
        {comments.length > 0 ? (
          <ul className="commentList">
            {comments.map((comment) =>
              comment && comment.id ? (
                <li key={comment.id} className="commentItem">
                  <p>
                    <strong>{comment.name}</strong>
                  </p>
                  <p>{comment.message}</p>
                  <p>{new Date(comment.created).toLocaleString()} </p>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="deleteButton"
                  >
                    Delete
                  </button>
                </li>
              ) : null
            )}
          </ul>
        ) : (
          <p className="noCommentsText">No comments available</p>
        )}
      </div>
    </div>
  );
};

export default CommentList;
