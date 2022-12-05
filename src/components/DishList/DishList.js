import { Box, Container, Paper, Typography } from "@mui/material";

const DishList = ({ decided, undecided }) => {
  return (
    // <div>
    //   <ul>
    //     {decided.map((value) => (
    //       <li key={value}>☑{value}</li>
    //     ))}
    //     {undecided.map((value) => (
    //       <li key={value}>{value}</li>
    //     ))}
    //   </ul>
    // </div>
    <Box
      sx={{
        width: "97%",
        height: "20%",
        display: "flex",
        m: 2,
        // "& > :not(style)": {
        //   m: 1,
        //   width: 512,
        //   height: 128,
        // },
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "50%",
          m: 2,
        }}
      >
        {/* <Container maxWidth="sm" sx={{ height: "10%" }}>
          aiueo
        </Container> */}
        <Typography align="center" variant="h6" sx={{ m: 1 }}>
          登録済
        </Typography>
        <Container fixed sx={{ height: "50%" }}>
          <Typography sx={{ overflowY: "scroll" }}>
            <ul>
              {decided.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </Typography>
        </Container>
      </Paper>
      <Paper
        elevation={3}
        sx={{
          width: "50%",
          m: 2,
        }}
      >
        <Typography align="center" variant="h6" sx={{ m: 1 }}>
          未登録
        </Typography>
        <Container fixed sx={{ height: "50%" }}>
          <Typography sx={{ overflowY: "scroll" }}>
            <ul>
              {undecided.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </Typography>
        </Container>
      </Paper>
    </Box>
  );
};

export default DishList;
