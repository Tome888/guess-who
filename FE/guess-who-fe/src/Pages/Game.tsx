import LiveChat from "../components/LiveChat";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import CardPersonas from "../components/CardPersonas";
import VideoChat from "../components/VideoChat";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Confetti from "../components/Confetti";
import GuessAgent from "../components/GuessAgent";
// import VideoChat from "../components/VideoChat";

function Game() {
  const socketRef = useRef<any>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [msgState, setMsgState] = useState("");
  const [personas, setPersonas] = useState<any[]>([]);
  const [fullDataGame, setFullDataGame] = useState<any>(null);
  // const [agentList, setAgentList] = useState([]);
  // const [playerTurn, setPlayerTurn] = useState<null | string>(null);

  const [guess, setGuess] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (guess) {
      // localStorage.removeItem("myName");
      localStorage.removeItem("myId");

      disconectMsg();
      navigate(`/winner/${guess.userGuess.userIdWon}`);
      return;
    }
  }, [guess]);

  useEffect(() => {
    // setGuessFunc()
    console.log(guess, "TESTING THE GUESS");
  }, [guess]);

  useEffect(() => {
    const roomObj = localStorage.getItem("joinGame");
    const myIdObj = localStorage.getItem("myId");

    if (!roomObj) {
      console.error("Missing room ID "); // Log the error or handle it appropriately
      return; // Just return without doing anything
    }

    if (!myIdObj) {
      console.error("Missing user ID"); // Log the error or handle it appropriately
      return; // Just return without doing anything
    }

    const roomId = JSON.parse(roomObj).id;
    const myId = JSON.parse(myIdObj);
    const joinRoomObj = {
      roomId,
      myId,
    };

    socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
      query: { "x-api-key": `${import.meta.env.VITE_SECRET_KEY}` },
    });

    socketRef.current.on("join-room", (res: any) => {
      console.log(res, "tEST");
      // console.log(res.players[0].id);
      const player = res.players.find((player: any) => player.id === myId);

      if (player && res) {
        setPersonas(player.gameState);
        setFullDataGame(res);
      } else {
        navigate("/");
      }
    });

    socketRef.current.on("send-message", (msg: any) => {
      setChatHistory((prev) => [...prev, msg]);
    });
    socketRef.current.on("guess-agent", (guessData: any) => {
      setGuess(guessData);
    });
    socketRef.current.on("game-state", (state: any) => {
      console.log(state, "yyyyyyy");
      setFullDataGame(state);
    });
    socketRef.current.on("disconect-user", (msg: any) => {
      console.log(msg, "diskonekt");
    });
    socketRef.current.emit("join-room", joinRoomObj);

    // Cleanup on unmount
    return () => {
      // socketRef.current.disconnect();
      disconectMsg();
    };
  }, []);

  // const getAgentList = () => {
  //   const agentsLs = localStorage.getItem("agentsList");

  //   if (agentsLs) {
  //     const parsedList = JSON.parse(agentsLs);
  //     setAgentList(parsedList);
  //     return;
  //   }
  // };

  const setGuessFunc = (agentGuess: string) => {
    const roomObj = localStorage.getItem("joinGame");
    const myIdObj = localStorage.getItem("myId");
    if (!roomObj) return console.error("Missing room Obj");
    if (!myIdObj) return console.error("Missing room User ID");
    const roomObjj = JSON.parse(roomObj);
    const myIdObjj = JSON.parse(myIdObj);
    if (fullDataGame.id !== roomObjj.id) return console.error("Faulty Room ID");
    const foundUser = fullDataGame.players.filter(
      (player: any) => player.id === myIdObjj
    );
    if (!foundUser[0]) return console.error("Faulty User ID");

    socketRef.current.emit("guess-agent", {
      roomId: fullDataGame.id,

      userId: foundUser[0].id,
      agent: agentGuess,
    });
  };

  const disconectMsg = () => {
    const lsMyIdData = localStorage.getItem("myId");
    if (!lsMyIdData) return console.error("Missing user ID");

    const parsedId = JSON.parse(lsMyIdData);
    if (!fullDataGame) return;
    socketRef.current.emit("disconect-user", {
      gameRoom: fullDataGame.id,
      userId: parsedId,
      msg: "remove from database",
    });

    // socketRef.current.disconnect();
  };

  // Function to send a message
  const sendMsgFunc = (stringMsg: string) => {
    const userId = localStorage.getItem("myId");
    const roomObj = localStorage.getItem("joinGame");
    const nameUserData = localStorage.getItem("myName");

    if (!roomObj) {
      console.error("Missing room ID");
      return;
    }

    const roomId = JSON.parse(roomObj).id;
    if (!userId) return new Error("user id is missing");

    if (!nameUserData) return new Error("Name of Player is missing");
    const nameOfUser = JSON.parse(nameUserData);
    const msgToSend = {
      room: roomId,
      userIo: JSON.parse(userId),
      sentMsg: stringMsg,
      nameOfUser,
    };

    socketRef.current.emit("send-message", msgToSend);
  };
  // =====WORKING GAME STATE CHANGE!=========

  const pickPersona = (newArr: any[]) => {
    const roomObj = localStorage.getItem("joinGame");
    const userId = localStorage.getItem("myId");

    if (!roomObj) {
      console.error("Missing room ID");
      return;
    }
    if (!userId) return new Error("user id is missing");
    const roomId = JSON.parse(roomObj).id;

    socketRef.current.emit("game-state", {
      newGameState: newArr,
      room: roomId,
      idOfUser: JSON.parse(userId),
    });
  };
  // =====WORKING GAME STATE CHANGE!=========

  // const setMyGuess = (agent: string) => {
  //   const roomObj = localStorage.getItem("joinGame");
  //   const userId = localStorage.getItem("myId");

  //   if (!roomObj) {
  //     console.error("Missing room ID");
  //     return;
  //   }
  //   if (!userId) return new Error("user id is missing");
  //   const roomId = JSON.parse(roomObj).id;
  // };

  return (
    <>
      {/* {fullDataGame && <NavBar gameData={fullDataGame} />} */}
      <Confetti active={false} />
      {fullDataGame && (
        <VideoChat
          roomId={fullDataGame.id}
          refSocket={socketRef}
          numPlayers={fullDataGame.players.length}
          allGameData={fullDataGame}
          setGameStateFunc={setFullDataGame}
        />
      )}

      <div className="cardChatWrapper">
        <CardPersonas
          arrPersonas={personas}
          pickFunction={pickPersona}
          changePersonas={setPersonas}
          fullData={fullDataGame}
        />
        <LiveChat
          chatHistory={chatHistory}
          sendMsgFunc={sendMsgFunc}
          msgState={msgState}
          setMsgState={setMsgState}
        />
        {fullDataGame && (
          <GuessAgent
            guessFunc={setGuessFunc}
            roomId={fullDataGame.id}
            playerArr={fullDataGame.players}
          />
        )}
      </div>
    </>
  );
}

export default Game;
