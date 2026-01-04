import React, { useEffect, useState } from "react";
import { Container, Typography, TextField, Button, Box, Snackbar, Alert, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import api from "../api/axios";
import useAuthStore from "../store/auth";
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
    const { token, userId } = useAuthStore();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [hasImage, setHasImage] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
    const navigate = useNavigate();

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: "", severity: "" });
    }

    useEffect(() => {
        if (!token || !userId) {
            setSnackbar({ open: true, message: "You are not logged in.", severity: "error" });
            setTimeout(() => navigate("/login"), 1000);
        }
    }, [token, userId, navigate])

    useEffect(() => {
        if (!token || !userId) return;

        const loadProfile = async () => {
            try {
                const res = await api.get(`/users/${userId}`, {
                    headers: { "X-Authorization": token },
                });
                setFirstName(res.data.firstName);
                setLastName(res.data.lastName);
                setEmail(res.data.email);
            } catch {
                setSnackbar({ open: true, message: "Failed to load profile.", severity: "error" });
            }

            try {
                await api.get(`/users/${userId}/image`);
                setHasImage(true);
            } catch {
                setHasImage(false);
            }
        };

        loadProfile();
    }, [token, userId])

    const handleUpdate = async () => {
        try {
            const updateData: any = { firstName, lastName, email };

            if (newPassword) {
                if (newPassword.length < 6) {
                    setSnackbar({ open: true, message: "Password must be at least 6 characters.", severity: "error" });
                    return;
                }
                if (!currentPassword) {
                    setSnackbar({ open: true, message: "Current password required to change password.", severity: "error" });
                    return;
                }
                updateData.currentPassword = currentPassword;
                updateData.password = newPassword;
            }

            await api.patch(`/users/${userId}`, updateData, {
                headers: { "X-Authorization": token },
            })

            if (imageFile) {
                const mimeType = imageFile.type;
                if (!["image/jpeg", "image/png", "image/gif"].includes(mimeType)) {
                    setSnackbar({ open: true, message: "Invalid image format.", severity: "error" });
                    return;
                }

                await api.put(`/users/${userId}/image`, imageFile, {
                    headers: {
                        "X-Authorization": token,
                        "Content-Type": mimeType,
                    }
                })
                setHasImage(true);
            }
            setSnackbar({ open: true, message: "You have updated your profile", severity: "success" });
            setTimeout(() => navigate("/profile"), 1000);
        } catch (err: any) {
            const msg = err.response?.statusText || "Update failed";
            setSnackbar({ open: true, message: msg, severity: "error" });
        }
    }

    const handleRemoveImage = async () => {
        try {
            await api.delete(`/users/${userId}/image`, { headers: { "X-Authorization": token },});
            setHasImage(false);
        } catch {
            setSnackbar({ open: true, message: "Failed to remove image.", severity: "error" });
        }
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Edit Profile</Typography>

            <TextField label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth margin="normal" />
            <TextField label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth margin="normal" />
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal" />

            <TextField label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} fullWidth margin="normal" />
            <TextField label="New Password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth margin="normal"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Box mt={2}>
                <input type="file" accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => {
                        if (e.target.files?.[0]) {
                            setImageFile(e.target.files[0]);
                        }
                    }}
                />
                {hasImage && (
                    <Button color="error" onClick={handleRemoveImage} sx={{ ml: 2 }}>
                        Remove Profile Picture
                    </Button>
                )}
            </Box>

            <Button variant="contained" color="primary" onClick={handleUpdate} sx={{ mt: 2 }} >
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

export default EditProfilePage;
