import React, { useEffect, useState } from "react";
import { Typography, Card, CardMedia, CardContent, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Game } from "../types/games";

interface Props {
    genreId: number;
    currentGameId: number;
}

const SimilarGames = ({ genreId, currentGameId }: Props) => {
    const [games, setGames] = useState<Game[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const res = await api.get("/games", {
                    params: {
                        genreIds: genreId,
                        count: 10
                    }
                });
                const filtered = res.data.games.filter((g: Game) => g.gameId !== currentGameId);
                setGames(filtered.slice(0, 20));
            } catch {
                setGames([]);
            }
        }
        fetchSimilar();
    }, [genreId, currentGameId])

    let content;

    if (games.length === 0) {
        content = <Typography>No similar games found.</Typography>;
    } else {
        content = (
            <Box display="flex" overflow="auto" gap={2} mt={2}>
                {games.map((game) => (
                    <Card key={game.gameId} sx={{width: 180, height: 180, flexShrink: 0, cursor: "pointer", transition: "0.2s", ":hover": { boxShadow: 4 }, overflow: "hidden"}} onClick={() => navigate(`/games/${game.gameId}`)}>
                        <CardMedia component="img" height="100" image={`http://localhost:4941/api/v1/games/${game.gameId}/image`} alt={`${game.title} image`} onError={(e: any) => (e.target.style.display = "none")}/>
                        <CardContent>
                            <Typography variant="subtitle2" noWrap>{game.title}</Typography>
                            <Typography variant="caption" noWrap>Price: ${(game.price / 100)}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        )
    }

    return (
        <Box mt={4}>
            <Typography variant="h6">Similar Games</Typography>
            {content}
        </Box>
    )
}

export default SimilarGames;
