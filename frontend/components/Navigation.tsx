import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Search, User, Film, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/", label: "Recommandations", icon: Film },
    { to: "/search", label: "Recherche", icon: Search },
    { to: "/profile", label: "Profil", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Film className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Film Finder</span>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                  >
                    {({ isActive }) => (
                      <motion.div
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden md:block">{item.label}</span>
                      </motion.div>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* User info and logout */}
            <div className="flex items-center space-x-3 border-l border-border pl-4">
              <span className="text-sm text-muted-foreground hidden md:block">
                {user?.name}
              </span>
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block text-sm">Déconnexion</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}