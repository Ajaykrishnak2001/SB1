import React from 'react';
import { Box, Typography, Button, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User, BarChart2, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };
  
  return (
    <Box className="min-h-screen bg-gray-50">
      <Box className="bg-white shadow-sm border-b border-gray-200">
        <Box className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user?.role === 'admin' && (
                <Link 
                  to="/dashboard"
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Box>
                </Link>
              )}
              <Link 
                to="/"
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChart2 size={16} />
                  Expert View
                </Box>
              </Link>
              <Link 
                to="/candidates"
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/candidates' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={16} />
                  Candidate View
                </Box>
              </Link>
            </Box>
            
            <Box>
              <Button
                id="profile-button"
                aria-controls={open ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                sx={{ 
                  textTransform: 'none',
                  color: '#1e293b',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: '#f1f5f9' }
                }}
                startIcon={
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32,
                      backgroundColor: '#e0f2fe',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {user?.name?.charAt(0) || "?"}
                  </Avatar>
                }
              >
                {user?.name}
                {user?.role === 'expert' && (
                  <Typography variant="caption" sx={{ color: '#64748b', ml: 1 }}>
                    ({user.expertName})
                  </Typography>
                )}
              </Button>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'profile-button',
                }}
                PaperProps={{
                  elevation: 2,
                  sx: {
                    minWidth: 180,
                    borderRadius: '8px',
                    mt: 1,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      fontSize: '0.875rem',
                    }
                  }
                }}
              >
                <MenuItem onClick={handleClose} sx={{ color: '#1e293b' }}>
                  <User size={16} className="mr-2" />
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
}