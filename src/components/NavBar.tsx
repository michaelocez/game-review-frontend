import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Snackbar, Alert } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { AccountCircle } from "@mui/icons-material";
import useAuthStore from "../store/auth";
import api from "../api/axios";

const NavBar = () => {
    const { token, clearAuth } = useAuthStore();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: "" });

    const handleSnackbarClose = () => {
        setSnackbar({ open: false, message: ""});
    }

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleMenuClose = () => {
        setAnchorEl(null);
    }

    const handleLogout = async () => {
        try {
            await api.post("/users/logout", {}, {headers: { "X-Authorization": token },});
            clearAuth();
            navigate("/");
        } catch (err: any) {
            const msg = err.response?.statusText || "Logout failed";
            setSnackbar({ open: true, message: msg });
        } finally {
            handleMenuClose();
        }
    }

    let menuItems: React.ReactNode[] = [];

    if (token) {
        menuItems = [
            <MenuItem key="profile" component={NavLink} to="/profile" onClick={handleMenuClose}>
                Profile
            </MenuItem>,
            <MenuItem key="logout" onClick={handleLogout}>
                Logout
            </MenuItem>
        ]
    } else {
        menuItems = [
            <MenuItem key="login" component={NavLink} to="/login" onClick={handleMenuClose}>
                Login
            </MenuItem>,
            <MenuItem key="register" component={NavLink} to="/register" onClick={handleMenuClose}>
                Register
            </MenuItem>
        ]
    }

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }} component={NavLink} to="/">
                        Game Review Site
                    </Typography>

                    <Box>
                        {token &&
                            <Button color="inherit" component={NavLink} to="/games/create">
                                Create Game
                            </Button>
                        }
                        <IconButton size="large" color="inherit" onClick={handleMenuOpen}>
                            <AccountCircle />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            {menuItems}
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert severity="error" sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    )
}

export default NavBar;
