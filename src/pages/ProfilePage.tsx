import React, { useEffect, useState } from "react";
import { Container, Typography, Avatar, Snackbar, Alert, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/auth";

const ProfilePage = () => {
    const { token, userId } = useAuthStore();
    const [userData, setUserData] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("/default-profile.png");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
    const navigate = useNavigate();

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: "", severity: "" });
    }

    useEffect(() => {
        if (!token || !userId) {
            setSnackbar({ open: true, message: "You are not logged in", severity: "error" });
            setTimeout(() => navigate("/login"), 1000);
        }
    }, [token, userId, navigate])

    useEffect(() => {
        if (!token || !userId) {
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await api.get(`/users/${userId}`, {
                    headers: { "X-Authorization": token }
                });
                setUserData(res.data);
            } catch (err: any) {
                const msg = err.response?.statusText || "Failed to load profile.";
                setSnackbar({ open: true, message: msg, severity: "error" });
            }

            try {
                const imageRes = await api.get(`/users/${userId}/image`, { responseType: "blob" });
                const imageURL = URL.createObjectURL(imageRes.data);
                setImageUrl(imageURL);
            } catch {
                setImageUrl("/default-profile.png");
            }
        };

        fetchProfile();
    }, [token, userId])

    const handleEditProfile = () => {
        navigate("/profile/edit");
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>My Profile</Typography>

            <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar src={imageUrl} alt="Profile" sx={{ width: 80, height: 80 }} />
                <Box display="flex" justifyContent="space-between" width="100%">
                    <Box>
                        <Typography variant="h6">{userData?.firstName} {userData?.lastName}</Typography>
                        <Typography variant="body1" color="textSecondary">{userData?.email}</Typography>
                    </Box>
                    <Button variant="contained" color="primary" onClick={handleEditProfile}>
                        Edit Profile
                    </Button>
                </Box>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity={snackbar.severity as "success" | "error" } sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}

export default ProfilePage;
