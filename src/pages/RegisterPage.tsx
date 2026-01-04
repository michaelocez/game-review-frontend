import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box, InputAdornment, IconButton, Snackbar, Alert, Link } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/auth";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { setAuth, token } = useAuthStore();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
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

    const handleRegister = async () => {
        if (!isValidEmail(email)) {
            setSnackbar({ open: true, message: "Invalid email format.", severity: "error" });
            return;
        }

        try {
            await api.post("/users/register", { firstName, lastName, email, password });

            const loginRes = await api.post("/users/login", { email, password });
            const token = loginRes.data.token;
            const id = loginRes.data.userId;

            setAuth(token, id);

            if (imageFile) {
                const mimeType = imageFile.type;
                if (!["image/jpeg", "image/png", "image/gif"].includes(mimeType)) {
                    setSnackbar({ open: true, message: "Invalid image format.", severity: "error" });
                    return;
                }

                await api.put(`/users/${id}/image`, imageFile, {
                    headers: {"X-Authorization": token, "Content-Type": mimeType,},
                })
            }

            navigate("/");
        } catch (err: any) {
            const msg = err.response?.statusText || "Registration failed";
            setSnackbar({ open: true, message: msg, severity:"error" });
        }
    }

    return (
        <Container maxWidth="xs" sx={{ mt: 6 }}>
            <Typography variant="h4" gutterBottom>Register</Typography>
            <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth margin="normal" />
            <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth margin="normal" />
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />
            <TextField label="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal"
                slotProps={{
                    input: {
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <Box mt={2}>
                <input type="file" accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setImageFile(e.target.files[0]);
                        }
                    }}
                />
            </Box>
            <Button variant="contained" onClick={handleRegister} fullWidth sx={{ mt: 2 }}>
                Register
            </Button>

            <Box mt={2} sx={{ textAlign: "center" }}>
                <Typography variant="body2">
                    Already have an account?{" "}
                    <Link href="/login" sx={{ textDecoration: "none", fontWeight: "bold" }}>
                        Login here
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

export default RegisterPage;
