import { LinearProgress, Typography, Box, CircularProgress } from "@mui/material";

const LoadingComponent = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        gap: 4
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h6" 
          fontFamily={"Quicksand"}
          sx={{ 
            fontWeight: 500,
            mb: 2
          }}
        >
          Getting things ready
        </Typography>
        
        <Box sx={{ width: '250px' }}>
          <LinearProgress 
            sx={{ 
              height: 4, 
              borderRadius: 2,
              backgroundColor: '#464343ff',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                backgroundColor: 'white',
              }
            }} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LoadingComponent;