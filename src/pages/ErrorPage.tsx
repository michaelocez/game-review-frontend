import React from "react";
import { Typography, Container, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

interface ErrorPageProps {
    statusCode?: number;
    message?: string;
}

const ErrorPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as ErrorPageProps;
    const statusCode = state?.statusCode || 500;
    const message = state?.message || (statusCode === 404 ? "Page Not Found" : "Something went wrong.");

    return (
        <Container sx={{ textAlign: "center", mt: 10 }}>
            <Typography variant="h2" color="error" gutterBottom>
                Error {statusCode}
            </Typography>
            <Typography variant="h5" gutterBottom>
                {message}
            </Typography>
            <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate("/")}>
                Go Home
            </Button>
        </Container>
    )
}

export default ErrorPage;
