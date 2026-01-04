import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, TextField, Select, MenuItem, InputLabel, FormControl, Button, Snackbar, Alert, SelectChangeEvent } from "@mui/material";
import GameListObject from "./GameListObject";
import api from "../api/axios";
import useAuthStore from "../store/auth";
import { Game, Genre, Platform } from "../types/games";

const GameList = () => {
    const { token } = useAuthStore();
    const [games, setGames] = useState<Game[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [search, setSearch] = useState("");
    const [selectedGenre, setSelectedGenre] = useState<number | "">("");
    const [selectedPlatform, setSelectedPlatform] = useState<number | "">("");
    const [sortBy, setSortBy] = useState("ALPHABETICAL_ASC");
    const [filterOwned, setFilterOwned] = useState(false);
    const [filterWishlisted, setFilterWishlisted] = useState(false);
    const [priceFilter, setPriceFilter] = useState("");
    const [priceValue, setPriceValue] = useState<number | "">("");
    const [startIndex, setStartIndex] = useState(0);
    const count = 12;
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: "", severity: "" });
    }

    const fetchMetadata = async () => {
        try {
            const [genreRes, platformRes] = await Promise.all([
                api.get("/games/genres"),
                api.get("/games/platforms"),
            ]);
            setGenres(genreRes.data);
            setPlatforms(platformRes.data);
        } catch (err: any) {
            const msg = err.response?.statusText || "Failed to fetch metadata.";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }

    const fetchGames = useCallback(async () => {
        try {
            const response = await api.get("/games", {
                headers: token ? { "X-Authorization": token } : undefined,
                params: {
                    q: search || undefined,
                    genreIds: selectedGenre !== "" ? selectedGenre : undefined,
                    platformIds: selectedPlatform !== "" ? selectedPlatform : undefined,
                    sortBy,
                    count,
                    startIndex,
                    ownedByMe: filterOwned || undefined,
                    wishlistedByMe: filterWishlisted || undefined,
                    priceFilter: priceFilter || undefined,
                    price: priceValue !== "" ? priceValue * 100 : undefined,
                },
            });
            setGames(response.data.games);
        } catch (err: any) {
            const msg = err.response?.statusText || "Failed to fetch games.";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }, [
        token,
        search,
        selectedGenre,
        selectedPlatform,
        sortBy,
        startIndex,
        filterOwned,
        filterWishlisted,
        priceFilter,
        priceValue,
    ]);

    useEffect(() => {
        fetchMetadata();
    }, [])

    useEffect(() => {
        fetchGames();
    }, [fetchGames])


    const handleGenreChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setSelectedGenre(value === "" ? "" : Number(value));
    }

    const handlePlatformChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setSelectedPlatform(value === "" ? "" : Number(value));
    }

    const handlePrev = () => setStartIndex((prev) => Math.max(0, prev - count));
    const handleNext = () => setStartIndex((prev) => prev + count);
    const currentPage = Math.floor(startIndex / count) + 1;

    return (
        <Box>
            <Typography variant="h4" align="center" gutterBottom>
                Browse Games
            </Typography>

            <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2} mb={2}>
                <TextField label="Search" value={search} onChange={(e) => setSearch(e.target.value)}/>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Genre</InputLabel>
                    <Select value={selectedGenre === "" ? "" : String(selectedGenre)} onChange={handleGenreChange} label="Genre">
                        <MenuItem value="">All Genres</MenuItem>
                        {genres.map((genre) => (
                            <MenuItem key={genre.genreId} value={String(genre.genreId)}>
                                {genre.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Platform</InputLabel>
                    <Select value={selectedPlatform === "" ? "" : String(selectedPlatform)} onChange={handlePlatformChange} label="Platform">
                        <MenuItem value="">All Platforms</MenuItem>
                        {platforms.map((platform) => (
                            <MenuItem key={platform.platformId} value={String(platform.platformId)}>
                                {platform.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} label="Sort By">
                        <MenuItem value="ALPHABETICAL_ASC">A–Z</MenuItem>
                        <MenuItem value="ALPHABETICAL_DESC">Z–A</MenuItem>
                        <MenuItem value="CREATED_ASC">Oldest First</MenuItem>
                        <MenuItem value="CREATED_DESC">Newest First</MenuItem>
                        <MenuItem value="PRICE_ASC">Price Low to High</MenuItem>
                        <MenuItem value="PRICE_DESC">Price High to Low</MenuItem>
                        <MenuItem value="RATING_ASC">Rating Low to High</MenuItem>
                        <MenuItem value="RATING_DESC">Rating High to Low</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Price Filter</InputLabel>
                    <Select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} label="Price Filter">
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="LT">Less than</MenuItem>
                        <MenuItem value="LTE">Less than or equal to</MenuItem>
                        <MenuItem value="EQ">Equal to</MenuItem>
                        <MenuItem value="GTE">Greater than or equal to</MenuItem>
                        <MenuItem value="GT">Greater than</MenuItem>
                    </Select>
                </FormControl>

                <TextField type="number" label="Price ($)" value={priceValue} onChange={(e) => setPriceValue(Number(e.target.value))} sx={{ width: 150 }}/>
            </Box>

            {token && (
                <Box mb={2} display="flex" justifyContent="center" gap={2}>
                    <Button variant={filterWishlisted ? "contained" : "outlined"} onClick={() => setFilterWishlisted(!filterWishlisted)}>
                        Wishlisted
                    </Button>
                    <Button variant={filterOwned ? "contained" : "outlined"} onClick={() => setFilterOwned(!filterOwned)}>
                        Owned by Me
                    </Button>
                </Box>
            )}

            <Box display="flex" justifyContent="center">
                <Box display="grid" gridTemplateColumns="repeat(4, 280px)" gap={3} justifyContent="center" alignContent="center" minHeight="900px">
                    {games.length === 0 && <Typography>No games found.</Typography>}
                    {games.map((game) => (
                        <GameListObject key={game.gameId} game={game} />
                    ))}
                </Box>
            </Box>

            <Box mt={3} display="flex" justifyContent="center" gap={3}>
                <Button variant="contained" onClick={handlePrev} disabled={startIndex === 0}>
                    Previous
                </Button>
                <Typography>Page {currentPage}</Typography>
                <Button variant="contained" onClick={handleNext} disabled={games.length < count}>
                    Next
                </Button>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity={snackbar.severity as "success" | "error" } sx={{ width: "100%" }}>
                {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}

export default GameList;
