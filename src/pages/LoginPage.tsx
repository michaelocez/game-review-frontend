import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, Snackbar, Alert, InputAdornment, IconButton, Link } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/auth";

const LoginPage = () => {
    const { setAuth, token } = useAuthStore();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
    const isValidEmail = (email: string) => /^[^@.\s]+@[^@.\s]+\.[^@.\s]+$/.test(email);

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: "", severity: "" });
    }

    useEffect(() => {
        if (token) {
            setSnackbar({ open: true, message: "You're already logged in.", severity: "error" });
            setTimeout(() => navigate("/"), 1000);
        }
    }, [token, navigate])

    const handleLogin = async () => {
        if (!isValidEmail(email)) {
            setSnackbar({ open: true, message: "Invalid email format.", severity: "error" });
            return;
        }

        try {
            const res = await api.post("/users/login", { email, password });
            const token = res.data.token;
            const userId = res.data.userId;

            setAuth(token, userId);
            navigate("/");
        } catch (err: any) {
            const msg = err.response?.statusText || "Login failed";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    }

    return (
        <Container maxWidth="xs" sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>Login</Typography>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal"/>
            <TextField label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} fullWidth margin="normal"
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <Box mt={2}>
                <Button variant="contained" onClick={handleLogin} fullWidth>
                    Login
                </Button>
            </Box>

            <Box mt={2} sx={{ textAlign: "center" }}>
                <Typography variant="body2">
                    Don't have an account?{" "}
                    <Link href="/register" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                        Register here
                    </Link>
                </Typography>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity={snackbar.severity as "success" | "error" } sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default LoginPage;
