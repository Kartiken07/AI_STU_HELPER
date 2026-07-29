import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  isLoggedIn: boolean;
  children: React.JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />; // redirect to login if not logged in
  }
  return children;
};

export default PrivateRoute;
