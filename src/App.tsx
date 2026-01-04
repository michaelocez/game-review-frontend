import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from "./pages/RegisterPage";
import GameList from "./components/GameList";
import GameDetail from "./components/GameDetail";
import CreateGamePage from "./pages/CreateGamePage";
import EditGamePage from "./pages/EditGamePage";
import NavBar from "./components/NavBar";
import ErrorPage from "./pages/ErrorPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";

function App() {
    return (
        <div className="App">
            <Router>
                <div>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<GameList />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/games/:id" element={<GameDetail />} />
                        <Route path="/games/create" element={<CreateGamePage />} />
                        <Route path="/games/:id/edit" element={<EditGamePage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/edit" element={<EditProfilePage />} />
                        <Route path="/error" element={<ErrorPage />} />
                        <Route path="*" element={<Navigate to="/error" state={{ statusCode: 404, message: "Page Not Found" }} />}/>
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;
