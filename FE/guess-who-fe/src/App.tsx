import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import Home from "./Pages/Home";
import Game from "./Pages/Game";
import WildCart from "./Pages/WildCart";

function App() {
  const [joinGame, setJoinGame] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home permit={joinGame} setFunc={setJoinGame} />}
        />
        <Route path="/game-on" element={joinGame ? <Game /> : <WildCart />} />
        {/* <Route
          path="/winner/:idWin/:agent/:idLoser"
          element={joinGame ? <h2>TESTING ROUTE</h2> : <WildCart />}
        /> */}
        <Route
          path="/winner/:idWin"
          element={joinGame ? <h2>TESTING ROUTE</h2> : <WildCart />}
        />
        <Route path="*" element={<WildCart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
