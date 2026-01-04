import React, { useCallback, useEffect, useState} from "react";
import { Typography, Box, Divider, TextField, Button, Snackbar, Alert } from "@mui/material";
import api from "../api/axios";
import { Review } from "../types/games";
import useAuthStore from "../store/auth";

interface Props {
    gameId: number;
    owned: boolean;
}

const GameReviews = ({ gameId, owned }: Props) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState<number>(1);
    const [reviewText, setReviewText] = useState<string>("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
    const { token } = useAuthStore();

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: "", severity: "" });
    }

    const fetchReviews = useCallback(async () => {
        try {
            const res = await api.get(`/games/${gameId}/reviews`);
            setReviews(res.data);
        } catch (err: any) {
            const msg = err.response?.statusText || "Failed to load reviews.";
            setSnackbar({ message: msg, open: true, severity: "error" });
        }
    }, [gameId])

    useEffect(() => { fetchReviews(); }, [gameId, fetchReviews]);

    const handleSubmitReview = async () => {
        try {
            await api.post(`/games/${gameId}/reviews`, { rating, review: reviewText }, { headers: { "X-Authorization": token } });
            setReviewText("");
            setRating(1);
            fetchReviews();
        } catch (err: any) {
            const msg = err.response?.statusText || "Error submitting review.";
            setSnackbar({ message: msg, open: true, severity: "error" });
        }
    }

    let reviewContent;
    if (reviews.length === 0) {
        reviewContent = <Typography>No reviews yet.</Typography>;
    } else {
        reviewContent = reviews.map((r, i) => (
            <Box key={i} mb={2}>
                <Typography variant="subtitle2">
                    {r.reviewerFirstName} {r.reviewerLastName} - {r.rating}/10
                </Typography>
                <Typography variant="body2">{r.review}</Typography>
                <Typography variant="caption" color="textSecondary">
                    {new Date(r.timestamp).toLocaleString()}
                </Typography>
                <Divider sx={{ mt: 1 }} />
            </Box>
        ))
    }

    return (
        <Box mt={4}>
            <Typography variant="h5" gutterBottom>
                Reviews
            </Typography>
            {reviewContent}
            {owned && (
                <Box mt={3}>
                    <Typography variant="h6">Leave a Review</Typography>
                    <TextField label="Your Review" fullWidth value={reviewText} onChange={(e) => setReviewText(e.target.value)} multiline rows={3} sx={{ my: 1 }}/>
                    <TextField label="Rating (1-10)" type="number" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} sx={{ mr: 2 }}/>
                    <Button variant="contained" onClick={handleSubmitReview}>
                        Submit Review
                    </Button>
                </Box>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity={snackbar.severity as "success" | "error" } sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default GameReviews;