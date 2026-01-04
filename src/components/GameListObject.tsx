import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, CardMedia, Box, Avatar, Stack } from "@mui/material";
import { Game } from "../types/games";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

interface GameProps {
    game: Game;
}

const GameListObject = ({ game }: GameProps) => {
    const [imageUrl, setImageUrl] = useState<string>("");
    const [creatorImageUrl, setCreatorImageUrl] = useState<string>("");
    const [genreName, setGenreName] = useState<string>("");
    const [platformNames, setPlatformNames] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const imageRes = await api.get(`/games/${game.gameId}/image`, {responseType: "blob"});
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
                const genreRes = await api.get("/games/genres");
                const genre = genreRes.data.find((g: any) => g.genreId === game.genreId);
                if (genre) {
                    setGenreName(genre.name);
                }
            } catch {
                setGenreName("Unknown Genre");
            }

            try {
                const platformRes = await api.get("/games/platforms");
                const platformNames = platformRes.data.filter((p: any) => game.platformIds.includes(p.platformId)).map((p: any) => p.name);
                setPlatformNames(platformNames);
            } catch {
                setPlatformNames([]);
            }
        }
        fetchData();
    }, [game])

    return (
        <Box
            onClick={() => navigate(`/games/${game.gameId}`)}
            sx={{mb: 3, maxWidth: 600, cursor: "pointer", "&:hover": { boxShadow: 6 },}}>
            <Card>
                {imageUrl && (
                    <CardMedia component="img" height="180" image={imageUrl} alt={`${game.title} cover`}/>
                )}
                <CardContent>
                    <Typography variant="h6">{game.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        Created on: {new Date(game.creationDate).toLocaleDateString()}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        {creatorImageUrl && (
                            <Avatar alt="creator" src={creatorImageUrl} />
                        )}
                        <Typography variant="body2">
                            {game.creatorFirstName} {game.creatorLastName}
                        </Typography>
                    </Stack>

                    <Typography variant="body2">Genre: {genreName}</Typography>
                    <Typography variant="body2">Price: ${(game.price / 100).toFixed(2)}</Typography>
                    <Typography variant="body2">Rating: {game.rating}/10</Typography>
                    <Typography variant="body2">
                        Platforms: {platformNames.length > 0 ? platformNames.join(", ") : "None"}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    )
}

export default GameListObject;
