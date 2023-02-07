import "./App.css";

import { Helmet } from "react-helmet";

import MenuBar from "./components/MenuBar/MenuBar";
import DishList from "./components/DishList/DishList";
import Calendar from "./components/Calendar/Calendar";
import { useState, useCallback, useRef } from "react";
import {
  Button,
  createTheme,
  CssBaseline,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";

const App = () => {
  const [decidedDishes, setDecidedDishes] = useState([]);
  const [undecidedDishes, setUndecidedDishes] = useState([]);
  const [menu, setMenu] = useState([]);

  const inputRef = useRef(null);
  const childCalendarRef = useRef(null);

  /**
   * 料理を追加
   */
  const addDishes = () => {
    let dish = document.getElementById("dishInput").value;
    if (dish.length !== 0) {
      if (!undecidedDishes.includes(dish) && !decidedDishes.includes(dish)) {
        setUndecidedDishes((prevUndecidedDishes) =>
          [...prevUndecidedDishes, dish].sort((a, b) => (a > b ? 1 : -1))
        );
      } else {
        window.confirm("その料理は追加されています");
      }
    }
    document.getElementById("dishInput").value = "";
  };

  /**
   * 献立アップロード確認
   * @returns 返り値なし
   */
  const fileUpload = () => {
    if (menu.length !== 0) {
      if (
        window.confirm(
          "献立を作成していた場合、上書きされますがよろしいですか？"
        )
      ) {
        inputRef.current.click();
      } else {
        return;
      }
    } else {
      inputRef.current.click();
    }
  };

  /**
   * JSONファイルから献立を作成
   *
   * @param {Event} e イベント
   * @returns ファイルが読み込めなかった場合
   */
  const openFile = async (e) => {
    const files = e.target.files || e.dataTransfer.files;
    const file = files[0];
    console.log(e.target.value);

    if (e.target.value.length === 0) {
      return;
    }

    if (!checkFile(file)) {
      alert("ファイルを読み込めませんでした");
      return;
    }

    const logData = await getFileData(file);

    const logJSON = JSON.parse(logData);
    //console.log(logJSON);
    const dDtmp = [];
    for (const menu of logJSON.menu) {
      //console.log(menu.title);
      dDtmp.push(menu.title);
    }
    setDecidedDishes(dDtmp);
    setUndecidedDishes(logJSON.undecided);
    setMenu(logJSON.menu);

    e.target.value = "";
  };

  /**
   * ファイルの読み込み
   *
   * @param {File} file JSONファイル
   * @returns {Promise} 成功，失敗（非同期処理の結果）
   */
  const getFileData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * ファイルの形式チェック
   *
   * @param {File} file ファイルオブジェクト
   * @returns {Boolean} 形式に合わないならFalse，合っていればTrue
   */
  const checkFile = (file) => {
    if (!file) {
      return false;
    }

    if (file.type !== "application/json") {
      return false;
    }

    const SIZE_LIMIT = 10000000;
    if (file.size > SIZE_LIMIT) {
      return false;
    }

    return true;
  };

  /**
   * 献立をJSONファイルに書きだし
   */
  const writeToFile = useCallback(() => {
    const list = {
      undecided: undecidedDishes,
      menu,
    };
    const blob = new Blob([JSON.stringify(list)], {
      type: "application/json;charset=utf-8",
    });

    //saveAs(blob, "menu.json");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = "menu.json";
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(anchor.href);
    document.body.removeChild(anchor);
  }, [menu, undecidedDishes]);

  /**
   * 料理から献立を作成
   */
  const decideMenu = () => {
    const eventDates = childCalendarRef.current.getEventDates();

    const schedule = [];
    const dishes = [...undecidedDishes];

    const today = new Date();
    let len = dishes.length;
    while (len !== 0) {
      const year = today.getFullYear();
      const month = ("0" + (today.getMonth() + 1)).slice(-2);
      const day = ("0" + today.getDate()).slice(-2);

      if (eventDates.includes(`${year}-${month}-${day}`)) {
        eventDates.shift();
      } else {
        const rndNum = Math.floor(Math.random() * len);
        schedule.push({
          title: dishes[rndNum],
          date: `${year}-${month}-${day}`,
        });
        dishes[rndNum] = dishes[len - 1];
        len--;
      }
      today.setDate(today.getDate() + 1);
    }

    setMenu((prevMenu) =>
      [...prevMenu, ...schedule].sort((a, b) => (a.date > b.date ? 1 : -1))
    );
    setDecidedDishes((prevDecidedDishes) =>
      [...prevDecidedDishes, ...undecidedDishes].sort((a, b) =>
        a > b ? 1 : -1
      )
    );
    setUndecidedDishes([]);

    setMenu((oldMenu) => {
      console.log(oldMenu);
      return oldMenu;
    });
  };

  /**
   * 料理を削除
   */
  const deleteMenu = useCallback((title) => {
    setMenu((prevMenu) => prevMenu.filter((obj) => obj.title !== title));
    // setMenu((oldMenu) => {
    //   console.log(oldMenu);
    //   return oldMenu;
    // });

    setDecidedDishes((prevDecidedDishes) =>
      prevDecidedDishes
        .filter((dish) => dish !== title)
        .sort((a, b) => (a > b ? 1 : -1))
    );
    // setDecidedDishes((dish) => {
    //   console.log(dish);
    //   return dish;
    // });

    setUndecidedDishes((prevUndecidedDishes) =>
      [...prevUndecidedDishes, title].sort((a, b) => (a > b ? 1 : -1))
    );
    // setUndecidedDishes((dish) => {
    //   console.log(dish);
    //   return dish;
    // });
  }, []);

  /**
   * 献立を更新
   */
  const deleteAndAddMenu = useCallback((oldEventTitle, newEventDate) => {
    setMenu((prevMenu) =>
      prevMenu
        .map((obj) =>
          obj.title === oldEventTitle
            ? { title: obj.title, date: newEventDate }
            : obj
        )
        .sort((a, b) => (a.date > b.date ? 1 : -1))
    );

    // 更新した値をすぐ表示するにはこのように書く
    // setMenu((oldMenu) => {
    //   console.log(oldMenu);
    //   return oldMenu;
    // });
  }, []);

  // デザインテーマ
  const apptheme = createTheme({
    typography: {
      fontFamily: ['"Zen Maru Gothic"'].join(","),
    },
  });

  return (
    <ThemeProvider theme={apptheme}>
      <CssBaseline />
      <Helmet>
        <meta charSet="UTF-8" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap"
        />
        <title>献立作成プログラム</title>
      </Helmet>
      <MenuBar />
      <div>
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h5" sx={{ mr: 2 }}>
            料理を追加：
          </Typography>
          <TextField
            type="text"
            id="dishInput"
            size="small"
            label="料理"
            sx={{ mr: 1 }}
          ></TextField>
          <Button variant="contained" onClick={() => addDishes()}>
            追加
          </Button>
        </Toolbar>
        <div>
          <DishList decided={decidedDishes} undecided={undecidedDishes} />
        </div>
        <div>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={2}
          >
            <Button variant="contained" onClick={fileUpload}>
              献立アップロード
            </Button>
            <input hidden ref={inputRef} type="file" onChange={openFile} />
            <Button variant="contained" onClick={writeToFile}>
              献立ダウンロード
            </Button>
            <Button variant="contained" onClick={decideMenu}>
              献立作成
            </Button>
          </Stack>
        </div>
      </div>
      <Calendar
        ref={childCalendarRef}
        menu={menu}
        deleteMenu={deleteMenu}
        deleteAndAddMenu={deleteAndAddMenu}
      />
    </ThemeProvider>
  );
};

export default App;
