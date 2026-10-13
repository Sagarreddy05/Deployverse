import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("deployverse_user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [showRegister, setShowRegister] = useState(false);

    const handleLogin = (loggedInUser) => {

        localStorage.setItem(
            "deployverse_user",
            JSON.stringify(loggedInUser)
        );

        setUser(loggedInUser);
    };

    const handleLogout = () => {

        localStorage.removeItem("deployverse_user");

        setUser(null);
        setShowRegister(false);
    };

    if (user) {
        return (
            <Dashboard
                user={user}
                onLogout={handleLogout}
            />
        );
    }

    if (showRegister) {
        return (
            <Register
                onRegister={() => setShowRegister(false)}
                onGoToLogin={() => setShowRegister(false)}
            />
        );
    }

    return (
        <Login
            onLogin={handleLogin}
            onGoToRegister={() => setShowRegister(true)}
        />
    );
}

export default App;