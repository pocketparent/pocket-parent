import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminRoutes = () => {
  const [adminData, setAdminData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (data) => {
    setAdminData(data);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setAdminData(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Switch>
        <Route exact path="/admin">
          {isAuthenticated ? (
            <Redirect to="/admin/dashboard" />
          ) : (
            <AdminLogin onLogin={handleLogin} />
          )}
        </Route>
        <Route path="/admin/dashboard">
          {isAuthenticated ? (
            <AdminDashboard adminData={adminData} onLogout={handleLogout} />
          ) : (
            <Redirect to="/admin" />
          )}
        </Route>
        <Route path="*">
          <Redirect to="/admin" />
        </Route>
      </Switch>
    </Router>
  );
};

export default AdminRoutes;
