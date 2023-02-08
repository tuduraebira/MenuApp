import { Box, Container, Paper, Typography } from "@mui/material";

const DishList = ({ decided, undecided }) => {
  return (
    <Box
      sx={{
        width: "97%",
        height: "20%",
        display: "flex",
        m: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "50%",
          m: 3,
        }}
      >
        <Typography align="center" variant="h6" sx={{ m: 1 }}>
          登録済
        </Typography>
        <Container fixed sx={{ height: "50%" }}>
          <ul>
            {decided.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </Container>
      </Paper>
      <Paper
        elevation={3}
        sx={{
          width: "50%",
          m: 3,
        }}
      >
        <Typography align="center" variant="h6" sx={{ m: 1 }}>
          未登録
        </Typography>
        <Container fixed sx={{ height: "50%" }}>
          <ul>
            {undecided.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </Container>
      </Paper>
    </Box>
  );
};

export default DishList;
