import React from "react";
import { Box, Typography, Button, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();
  console.log("🔹 User from AuthContext:", user);

  const navigate = useNavigate();
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
    navigate("/login");
  };

  // ✅ Display name with expert name in brackets
  const displayName = user
    ? `${user.name || "Guest"}${user.expertName ? ` (${user.expertName})` : ""}`
    : "Guest";
  
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        padding: 2,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
      }}
    >
      {/* Left Section */}
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Interview Reports
        </Typography>
        {user?.role === "expert" && (
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            Expert: {user.expertName || "Unknown"}
          </Typography>
        )}
      </Box>

      {/* Right Section */}
      {user && (
        <Box>
          <Button
            id="profile-button"
            aria-controls={open ? "profile-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            sx={{
              textTransform: "none",
              color: "#1e293b",
              fontWeight: 500,
              "&:hover": { backgroundColor: "#f1f5f9" },
            }}
            startIcon={
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#e0f2fe",
                  color: "#3b82f6",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                {avatarLetter}
              </Avatar>
            }
          >
            {displayName}
          </Button>

          {/* Profile Dropdown Menu */}
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{ "aria-labelledby": "profile-button" }}
            PaperProps={{
              elevation: 2,
              sx: {
                minWidth: 180,
                borderRadius: "8px",
                mt: 1,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1.5,
                  fontSize: "0.875rem",
                },
              },
            }}
          >
            <MenuItem onClick={handleClose} sx={{ color: "#1e293b" }}>
              <User size={16} className="mr-2" />
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "#ef4444" }}>
              <LogOut size={16} className="mr-2" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
}
