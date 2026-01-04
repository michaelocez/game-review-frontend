import React, { useEffect, useState } from "react";
import {TextField, Button, Container, Typography, MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput, Box, Snackbar, Alert } from "@mui/material";
import api from "../api/axios";
import useAuthStore from "../store/auth";
import { Genre, Platform } from "../types/games";
import { useNavigate } from "react-router-dom";

const CreateGamePage = () => {
    const { token, userId } = useAuthStore();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [genreId, setGenreId] = useState<number | "">("");
    const [platformIds, setPlatformIds] = useState<number[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: "", severity: "" });
    }

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const genreRes = await api.get("/games/genres");
                const platformRes = await api.get("/games/platforms");
                setGenres(genreRes.data);
                setPlatforms(platformRes.data);
            } catch (err: any) {
                const msg = err.response?.statusText || "Failed to load genres/platforms.";
                setSnackbar({ open: true, message: msg, severity: "error" });
            }
        };
        fetchMetadata();
    }, [])

    const handleSubmit = async () => {
        if (!token || !userId) {
            setSnackbar({ open: true, message: "You must be logged in to create a game.", severity: "error" });
            return;
        }

        if (!title || !description || !genreId || platformIds.length === 0 || !imageFile) {
            setSnackbar({ open: true, message: "Please fill all fields.", severity: "error" });
            return;
        }

        try {
            const creationDate = new Date();
            const res = await api.post("/games", {title, description, price, genreId, platformIds, creationDate,}, { headers: { "X-Authorization": token } });


            const newGameId = res.data.gameId || res.data;

            if (imageFile) {
                const fileBlob = imageFile;
                const mimeType = fileBlob.type;

                if (!["image/jpeg", "image/png", "image/gif"].includes(mimeType)) {
                    setSnackbar({ open: true, message: "Invalid image format.", severity: "error" });
                    return;
                }

                await api.put(`/games/${newGameId}/image`, fileBlob, {
                    headers: {"X-Authorization": token, "Content-Type": mimeType}
                })
            }

            setSnackbar({ open: true, message: "Game created!", severity: "success" });
            setTimeout(() => navigate(`/games/${newGameId}`), 1000);
        } catch (err: any) {
            const msg = err.response?.statusText || "Error creating game.";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }


    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                Create a New Game
            </Typography>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" />
            <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth margin="normal" multiline rows={4} />
            <TextField label="Price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} fullWidth margin="normal" />

            <FormControl fullWidth margin="normal">
                <InputLabel>Genre</InputLabel>
                <Select value={genreId} onChange={(e) => setGenreId(Number(e.target.value))} input={<OutlinedInput label="Genre" />}>
                    {genres.map((g) => (
                        <MenuItem key={g.genreId} value={g.genreId}>{g.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
                <InputLabel>Platforms</InputLabel>
                <Select multiple value={platformIds} onChange={(e) => setPlatformIds(e.target.value as number[])} input={<OutlinedInput label="Platforms" />} renderValue={(selected) => platforms.filter((p) => selected.includes(p.platformId)).map((p) => p.name).join(", ")}>
                    {platforms.map((p) => (
                        <MenuItem key={p.platformId} value={p.platformId}>
                            <Checkbox checked={platformIds.includes(p.platformId)} />
                            <ListItemText primary={p.name} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box mt={2}>
                <input type="file" accept="image/*" onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setImageFile(e.target.files[0]);
                        }
                    }}
                />
            </Box>

            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
                Submit
            </Button>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity={snackbar.severity as "success" | "error" } sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default CreateGamePage;