import { Box, Typography, Button, Paper } from '@mui/material';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Unauthorized() {
  const navigate = useNavigate();

  return (
    <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Paper elevation={2} className="max-w-md w-full p-8 rounded-xl text-center">
        <Box 
          sx={{ 
            backgroundColor: '#fee2e2',
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <ShieldAlert className="text-red-600" size={32} />
        </Box>
        
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
          Access Denied
        </Typography>
        
        <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </Typography>
        
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            py: 1.5,
            px: 4,
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#2563eb',
            }
          }}
        >
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
}