"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Home() {
  const [username, setUsername] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAllComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/comments");
      const commentsData = response.data;
      //   console.log(commentsData);
      setComments(commentsData);
      setError("");
    } catch (error) {
      setError("Unable to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComments();

    socket.on("new_comment", (newComment) => {
      setComments((prevComments) => [newComment, ...prevComments]);
    });

    return () => {
      socket.off("new_comment");
    };
  }, []);

  const handleCommentSubmit = async () => {
    if (username.trim() === "" || comment.trim() === "") {
      alert("Username and comment cannot be empty.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/comments", {
        username,
        comment,
      });
      const newComment = response.data;

      setComments((prevComments) => [newComment, ...prevComments]);

      setComment("");
      setUsername("");
      setError("");
    } catch (error) {
      setError("failed to submit comment");
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Comment Section
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />

          <TextField
            label="Comment"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            margin="normal"
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCommentSubmit}
            style={{ marginTop: "10px", marginBottom: "20px" }}
          >
            ADD Comment
          </Button>

          <List>
            {comments.map((c) => (
              <ListItem key={c.id}>
                <ListItemText
                  primary={`${c.username}: ${c.comment}`}
                  secondary={new Date(c.timestamp).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Container>
  );
}
