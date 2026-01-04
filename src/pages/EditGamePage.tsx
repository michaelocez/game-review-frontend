import React, { useEffect, useState } from "react";
import { TextField, Button, Container, Typography, MenuItem, Select, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput, Box, Snackbar, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/auth";
import { Genre, Platform, GameFull } from "../types/games";

const EditGamePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [game, setGame] = useState<GameFull | null>(null);
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
        if (!token) {
            setSnackbar({ open: true, message: "You are not logged in.", severity: "error" });
            setTimeout(() => navigate("/"), 1000);
        }
    }, [token, navigate])

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const gameRes = await api.get(`/games/${id}`);
                const genreRes = await api.get("/games/genres");
                const platformRes = await api.get("/games/platforms");
                const data = gameRes.data;

                setGame(data);
                setTitle(data.title);
                setDescription(data.description);
                setPrice(data.price);
                setGenreId(data.genreId);
                setPlatformIds(data.platformIds);
                setGenres(genreRes.data);
                setPlatforms(platformRes.data);
            } catch (err: any) {
                const msg = err.response?.statusText || "Failed to load game data.";
                setSnackbar({ open: true, message: msg, severity: "error" });
            }
        };
        fetchMetadata();
    }, [id])

    const handleSubmit = async () => {
        if (!token) {
            setSnackbar({ open: true, message: "Please log in", severity: "error" });
            return;
        }

        try {
            await api.patch(`/games/${id}`, { title, description, price, genreId, platformIds }, { headers: { "X-Authorization": token } });

            if (imageFile) {
                const fileBlob = imageFile;
                const mimeType = fileBlob.type;

                if (!["image/jpeg", "image/png", "image/gif"].includes(mimeType)) {
                    setSnackbar({ open: true, message: "Invalid image format.", severity: "error" });
                    return;
                }

                await api.put(`/games/${id}/image`, fileBlob, {headers: {"X-Authorization": token, "Content-Type": mimeType,}});
            }

            setSnackbar({ open: true, message: "Game updated!", severity: "success" });
            setTimeout(() => navigate(`/games/${id}`), 1000);
        } catch (err: any) {
            const msg = err.response?.statusText || "Error updating game.";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }

    if (!game) return <Typography>Loading...</Typography>;

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Edit Game</Typography>
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
                        const files = e.target.files;
                        if (files && files.length > 0) {
                            setImageFile(files[0]);
                        }
                    }}
                />
            </Box>

            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
                Save Changes
            </Button>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity={snackbar.severity as "success" | "error" } sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default EditGamePage;