import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (user === undefined) return <p>Cargando...</p>;

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
