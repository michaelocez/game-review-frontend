import React, { useEffect, useState } from "react";
import { Button, Typography, Box, Card, CardMedia, CardContent, Avatar, Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/auth";
import { GameFull, Genre, Platform } from "../types/games";
import GameReviews from "./GameReviews";
import SimilarGames from "./SimilarGames";

const GameDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token, userId } = useAuthStore();
    const [game, setGame] = useState<GameFull | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [creatorImageUrl, setCreatorImageUrl] = useState("");
    const [wishlisted, setWishlisted] = useState(false);
    const [owned, setOwned] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
    const [reviewCount, setReviewCount] = useState(0);
    const [genreName, setGenreName] = useState("");
    const [platformNames, setPlatformNames] = useState<string[]>([]);

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: "", severity: "" });
    }

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const gameRes = await api.get(`/games/${id}`);
                const game = gameRes.data;
                setGame(game);

                try {
                    const imageRes = await api.get(`/games/${id}/image`, { responseType: "blob" });
                    setImageUrl(URL.createObjectURL(imageRes.data));
                } catch {
                    setImageUrl("");
                }

                try {
                    const creatorImageRes = await api.get(`/users/${game.creatorId}/image`, { responseType: "blob" });
                    setCreatorImageUrl(URL.createObjectURL(creatorImageRes.data));
                } catch {
                    setCreatorImageUrl("/default-profile.png");
                }

                try {
                    const [genreRes, platformRes] = await Promise.all([
                        api.get("/games/genres"),
                        api.get("/games/platforms")
                    ]);
                    const genre = genreRes.data.find((g: Genre) => g.genreId === game.genreId);
                    const platforms = platformRes.data.filter((p: Platform) => game.platformIds.includes(p.platformId));
                    setGenreName(genre?.name || "");
                    setPlatformNames(platforms.map((p: Platform) => p.name));
                } catch {
                    console.error("Could not fetch genre/platform info");
                }

                try {
                    const reviewsRes = await api.get(`/games/${id}/reviews`);
                    setReviewCount(reviewsRes.data.length);
                } catch {
                    setReviewCount(0);
                }

                if (token) {
                    try {
                        const [wishlistRes, ownedRes] = await Promise.all([
                            api.get("/games", {headers: { "X-Authorization": token }, params: { wishlistedByMe: true, count: 999 }}),
                            api.get("/games", {headers: { "X-Authorization": token }, params: { ownedByMe: true, count: 999 }}),
                        ]);
                        const wishlistIds = wishlistRes.data.games.map((g: any) => g.gameId);
                        const ownedIds = ownedRes.data.games.map((g: any) => g.gameId);
                        setWishlisted(wishlistIds.includes(Number(id)));
                        setOwned(ownedIds.includes(Number(id)));
                    } catch {
                        console.error("Could not fetch wishlist/owned");
                    }
                }
            } catch {
                navigate("/error", { state: { statusCode: 404, message: "Game not found" } });
            }
        }

        fetchAllData();
    }, [id, token, navigate])

    const toggleOwned = async () => {
        try {
            if (!token) {
                setSnackbar({ open: true, message: "Please log in", severity: "error" });
                return;
                }
            if (owned) {
                await api.delete(`/games/${id}/owned`, { headers: { "X-Authorization": token } });
            } else {
                await api.post(`/games/${id}/owned`, {}, { headers: { "X-Authorization": token } });
            }
            setOwned(!owned);
        } catch (err: any) {
            const msg = err.response?.statusText || "Error updating owned status.";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }

    const toggleWishlist = async () => {
        try {
            if (!token) {
                setSnackbar({ open: true, message: "Please log in", severity: "error" });
                return;
            }
            if (!wishlisted && owned) {
                setSnackbar({ open: true, message: "You cannot wishlist a game you already own.", severity: "error" });
                return;
            }
            if (wishlisted) {
                await api.delete(`/games/${id}/wishlist`, { headers: { "X-Authorization": token } });
            } else {
                await api.post(`/games/${id}/wishlist`, {}, { headers: { "X-Authorization": token } });
            }
            setWishlisted(!wishlisted);
        } catch (err: any) {
            const msg = err.response?.statusText || "Error updating wishlist status.";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this game?")) return;
        try {
            await api.delete(`/games/${id}`, { headers: { "X-Authorization": token } });
            setSnackbar({ open: true, message: "Game Deleted", severity: "success" });
            setTimeout(() => navigate(`/`), 1000);
        } catch (err: any) {
            const msg = err.response?.statusText || "Error deleting game.";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }

    if (!game) {
        return <Typography>Loading game details...</Typography>;
    }

    return (
        <>
            <Card
                sx={{display: "flex", flexDirection: { xs: "column", sm: "row" }, maxWidth: 1000, mx: "auto", mt: 4}}>
                {imageUrl && (
                    <CardMedia component="img" image={imageUrl} alt={`${game.title} cover`}
                               sx={{ width: { xs: "100%", sm: 350 }, objectFit: "cover" }}/>
                )}

                <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h4">{game.title}</Typography>
                    <Typography variant="body1" sx={{ my: 1 }}>{game.description}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Created on: {new Date(game.creationDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Genre: {genreName || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Platforms: {platformNames.join(", ") || "N/A"}
                    </Typography>

                    <Box display="flex" alignItems="center" mt={2}>
                        <Avatar src={creatorImageUrl} sx={{ mr: 1 }} />
                        <Typography variant="body2">
                            Created by: {game.creatorFirstName} {game.creatorLastName}
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Price: ${game.price / 100}
                    </Typography>
                    <Typography variant="body2">Rating: {game.rating}/10</Typography>
                    <Typography variant="body2">Reviews: {reviewCount}</Typography>

                    <Box mt={2}>
                        <Button variant="contained" onClick={toggleWishlist} sx={{ mr: 1 }}>
                            {wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                        </Button>
                        <Button variant="contained" onClick={toggleOwned} sx={{ mr: 1 }}>
                            {owned ? "Unmark as Owned" : "Mark as Owned"}
                        </Button>

                        {token && userId === game.creatorId && (
                            <Box mt={2}>
                                <Button variant="outlined" sx={{ mt: 1, mr: 1 }} onClick={() => navigate(`/games/${id}/edit`)}>
                                    Edit Game
                                </Button>
                                <Button variant="outlined" color="error" sx={{ mt: 1 }} onClick={handleDelete}>
                                    Delete Game
                                </Button>
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>

            <Box mt={4} maxWidth="1000px" mx="auto">
                <SimilarGames genreId={game.genreId} currentGameId={game.gameId} />
                <GameReviews gameId={Number(id)} owned={owned} />
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity={snackbar.severity as "success" | "error" } sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}

export default GameDetail;
