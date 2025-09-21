import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav style={{ /* ... your styles ... */ }}>
            <Link to="/">Sathi</Link>
            <div>
                {user ? (
                    <>
                        {user.role === 'caregiver' && <Link to="/dashboard">Dashboard</Link>}
                        {user.role === 'student' && <Link to="/student">My Day</Link>}
                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;