import "./App.css";
//import saveAs from "file-saver";

import { Helmet } from "react-helmet";

import MenuBar from "./components/MenuBar/MenuBar";
import DishList from "./components/DishList/DishList";
import Calendar from "./components/Calendar/Calendar";
import { useState, useCallback, useRef } from "react";
import {
  Button,
  createTheme,
  CssBaseline,
  IconButton,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import UploadFile from "@mui/icons-material/UploadFile";
//import { render } from "react-dom";

const App = () => {
  const [decidedDishes, setDecidedDishes] = useState([]);
  const [undecidedDishes, setUndecidedDishes] = useState([]);
  const [menu, setMenu] = useState([]);
  const [removedDate, setRemovedDate] = useState([]);

  const inputRef = useRef(null);
  const childCalendarRef = useRef(null);

  /**
   * 料理を追加
   */
  const addDishes = () => {
    let dish = document.getElementById("dishInput").value;
    if (dish.length !== 0) {
      setUndecidedDishes([...undecidedDishes, dish]);
    }
    document.getElementById("dishInput").value = "";
    //changeMenu(dish);
  };

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
  // TODO: ドラッグしたときメニューに更新する
  const decideMenu = () => {
    const eventDates = childCalendarRef.current.getEventDates();
    console.log(eventDates);

    const schedule = [];
    const tmpArr = [...undecidedDishes];
    // const rDate = [...removedDate];

    const today = new Date();
    let len = tmpArr.length;
    while (len !== 0) {
      //console.log(len, today);
      const year = today.getFullYear();
      const month = ("0" + (today.getMonth() + 1)).slice(-2);
      const day = ("0" + today.getDate()).slice(-2);

      if (`${year}-${month}-${day}` === eventDates[0]) {
        eventDates.shift();
      } else {
        const rndNum = Math.floor(Math.random() * len);
        schedule.push({
          title: tmpArr[rndNum],
          date: `${year}-${month}-${day}`,
        });
        tmpArr[rndNum] = tmpArr[len - 1];
        len--;
      }
      today.setDate(today.getDate() + 1);
    }

    // for (let i = 0, len = tmpArr.length; i < tmpArr.length; i++, len--) {
    //   const year = today.getFullYear();
    //   const month = ("0" + (today.getMonth() + 1)).slice(-2);
    //   const day = ("0" + today.getDate()).slice(-2);

    //   const rndNum = Math.floor(Math.random() * len);
    //   if (rDate.length !== 0) {
    //     const date = rDate.pop();
    //     //console.log(date);
    //     schedule.push({
    //       title: tmpArr[rndNum],
    //       date: date,
    //     });
    //   } else {
    //     schedule.push({
    //       title: tmpArr[rndNum],
    //       date: `${year}-${month}-${day}`,
    //     });
    //   }
    //   tmpArr[rndNum] = tmpArr[len - 1];
    //   today.setDate(today.getDate() + 1);
    // }
    console.log(schedule);

    setMenu([...menu, ...schedule]);
    setDecidedDishes([...decidedDishes, ...undecidedDishes]);
    setUndecidedDishes([]);
  };

  /**
   * 料理を追加
   */
  // const changeMenu = useCallback(
  //   (dish) => {
  //     if (typeof dish === "string") {
  //       setUndecidedDishes([...undecidedDishes, dish]);
  //       //console.log(undecidedDishes);
  //     } else {
  //       setUndecidedDishes(dish);
  //       //console.log(undecidedDishes);
  //     }
  //   },
  //   [undecidedDishes]
  // );

  const deleteMenu = useCallback(
    (mIndex, title) => {
      console.log(mIndex, title);

      const newMenu = [];
      menu.forEach((e, i) => {
        if (i !== mIndex) {
          newMenu.push(e);
        } else {
          const newRemovedDate = e.date;
          setRemovedDate([...removedDate, newRemovedDate]);
        }
      });
      setMenu(newMenu);

      const newDecidedDishes = [];
      const dIndex = decidedDishes.indexOf(title);
      decidedDishes.forEach((e, i) => {
        if (i !== dIndex) {
          newDecidedDishes.push(e);
        }
      });
      setDecidedDishes(newDecidedDishes);

      setUndecidedDishes([...undecidedDishes, title]);
    },
    [menu, undecidedDishes, decidedDishes, removedDate]
  );

  // const deleteAndAddMenu = useCallback(
  //   (oldEventIndex, oldEventTitle, newEventDate, newEventTitle) => {
  //     //console.log(mIndex, title);

  //     const newMenu = [];
  //     menu.forEach((e, i) => {
  //       if (i !== oldEventIndex) {
  //         newMenu.push(e);
  //       } else {
  //         const newRemovedDate = e.date;
  //         setRemovedDate([...removedDate, newRemovedDate]);
  //       }
  //     });
  //     setMenu(newMenu);

  //     // const newDecidedDishes = [];
  //     // const dIndex = decidedDishes.indexOf(title);
  //     // decidedDishes.forEach((e, i) => {
  //     //   if (i !== dIndex) {
  //     //     newDecidedDishes.push(e);
  //     //   }
  //     // });
  //     // setDecidedDishes(newDecidedDishes);

  //     // setUndecidedDishes([...undecidedDishes, title]);
  //   },
  //   [menu, undecidedDishes, decidedDishes, removedDate]
  // );

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
      <Calendar ref={childCalendarRef} menu={menu} deleteMenu={deleteMenu} />
    </ThemeProvider>
  );
};

export default App;
