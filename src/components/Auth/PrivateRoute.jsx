import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === undefined) return <p>Cargando...</p>;

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

/* Para testing usar

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div data-testid="loading">Cargando...</div>;
  }

  return isAuthenticated ? (
    <div data-testid="private-route">
      {children}
    </div>
  ) : (
    <Navigate to="/login" />
  );
};

export default PrivateRoute;

*/