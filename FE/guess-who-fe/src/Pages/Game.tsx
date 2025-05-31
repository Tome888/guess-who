// import LiveChat from "../components/LiveChat";
// import { useEffect, useState, useRef } from "react";
// import io from "socket.io-client";
// import CardPersonas from "../components/CardPersonas";
// import VideoChat from "../components/VideoChat";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import Confetti from "../components/Confetti";
// import GuessAgent from "../components/GuessAgent";
// import Spiner from "../components/Spiner";
// // import VideoChat from "../components/VideoChat";

// function Game() {
//   const socketRef = useRef<any>(null);
//   const [chatHistory, setChatHistory] = useState<string[]>([]);
//   const [msgState, setMsgState] = useState("");
//   const [personas, setPersonas] = useState<any[]>([]);
//   const [fullDataGame, setFullDataGame] = useState<any>(null);
//   // const [agentList, setAgentList] = useState([]);
//   // const [playerTurn, setPlayerTurn] = useState<null | string>(null);

//   const [guess, setGuess] = useState<any>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (guess) {
//       // localStorage.removeItem("myName");
//       localStorage.removeItem("myId");

//       disconectMsg();
//       navigate(
//         `/winner/${guess.userGuess.userIdWon}/${guess.userGuess.agent}/${guess.userGuess.userIdGuess}/${guess.userGuess.agentToGuess}`
//       );
//       return;
//     }
//   }, [guess]);

//   useEffect(() => {
//     // setGuessFunc()
//     console.log(guess, "TESTING THE GUESS");
//   }, [guess]);

//   useEffect(() => {
//     const roomObj = localStorage.getItem("joinGame");
//     const myIdObj = localStorage.getItem("myId");

//     if (!roomObj) {
//       console.error("Missing room ID "); // Log the error or handle it appropriately
//       return; // Just return without doing anything
//     }

//     if (!myIdObj) {
//       console.error("Missing user ID"); // Log the error or handle it appropriately
//       return; // Just return without doing anything
//     }

//     const roomId = JSON.parse(roomObj).id;
//     const myId = JSON.parse(myIdObj);
//     const joinRoomObj = {
//       roomId,
//       myId,
//     };

//     socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
//       query: { "x-api-key": `${import.meta.env.VITE_SECRET_KEY}` },
//     });

//     socketRef.current.on("join-room", (res: any) => {
//       console.log(res, "tEST");

//       const player = res.players.find((player: any) => player.id === myId);

//       const rawData = localStorage.getItem("joinGame");
//       if (!rawData) return;

//       const parsed = JSON.parse(rawData);

//       if (player && res) {
//         setPersonas(player.gameState);
//         setFullDataGame(res);
//         if (!parsed.players[1]) {
//           localStorage.setItem("joinGame", JSON.stringify(res));
//           console.log("we should update", res);
//         }
//       } else {
//         navigate("/");
//       }
//     });

//     socketRef.current.on("send-message", (msg: any) => {
//       setChatHistory((prev) => [...prev, msg]);
//     });
//     socketRef.current.on("guess-agent", (guessData: any) => {
//       setGuess(guessData);
//     });
//     socketRef.current.on("game-state", (state: any) => {
//       console.log(state, "yyyyyyy");
//       setFullDataGame(state);
//       // localStorage.setItem("joinGame", fullDataGame);
//     });
//     socketRef.current.on("disconect-user", (msg: any) => {
//       console.log(msg, "diskonekt");
//     });
//     socketRef.current.emit("join-room", joinRoomObj);

//     // Cleanup on unmount
//     return () => {
//       // socketRef.current.disconnect();
//       disconectMsg();
//     };
//   }, []);

//   // const getAgentList = () => {
//   //   const agentsLs = localStorage.getItem("agentsList");

//   //   if (agentsLs) {
//   //     const parsedList = JSON.parse(agentsLs);
//   //     setAgentList(parsedList);
//   //     return;
//   //   }
//   // };

//   const setGuessFunc = (agentGuess: string) => {
//     const roomObj = localStorage.getItem("joinGame");
//     const myIdObj = localStorage.getItem("myId");
//     if (!roomObj) return console.error("Missing room Obj");
//     if (!myIdObj) return console.error("Missing room User ID");
//     const roomObjj = JSON.parse(roomObj);
//     const myIdObjj = JSON.parse(myIdObj);
//     if (fullDataGame.id !== roomObjj.id) return console.error("Faulty Room ID");
//     const foundUser = fullDataGame.players.filter(
//       (player: any) => player.id === myIdObjj
//     );
//     if (!foundUser[0]) return console.error("Faulty User ID");

//     socketRef.current.emit("guess-agent", {
//       roomId: fullDataGame.id,

//       userId: foundUser[0].id,
//       agent: agentGuess,
//     });
//   };

//   const disconectMsg = () => {
//     const lsMyIdData = localStorage.getItem("myId");
//     if (!lsMyIdData) return console.log("Missing user ID");

//     const parsedId = JSON.parse(lsMyIdData);
//     if (!fullDataGame) return;
//     socketRef.current.emit("disconect-user", {
//       gameRoom: fullDataGame.id,
//       userId: parsedId,
//       msg: "remove from database",
//     });

//     // socketRef.current.disconnect();
//   };

//   // Function to send a message
//   const sendMsgFunc = (stringMsg: string) => {
//     const userId = localStorage.getItem("myId");
//     const roomObj = localStorage.getItem("joinGame");
//     const nameUserData = localStorage.getItem("myName");

//     if (!roomObj) {
//       console.error("Missing room ID");
//       return;
//     }

//     const roomId = JSON.parse(roomObj).id;
//     if (!userId) return new Error("user id is missing");

//     if (!nameUserData) return new Error("Name of Player is missing");
//     const nameOfUser = JSON.parse(nameUserData);
//     const msgToSend = {
//       room: roomId,
//       userIo: JSON.parse(userId),
//       sentMsg: stringMsg,
//       nameOfUser,
//     };

//     socketRef.current.emit("send-message", msgToSend);
//   };
//   // =====WORKING GAME STATE CHANGE!=========

//   const pickPersona = (newArr: any[]) => {
//     const roomObj = localStorage.getItem("joinGame");
//     const userId = localStorage.getItem("myId");

//     if (!roomObj) {
//       console.error("Missing room ID");
//       return;
//     }
//     if (!userId) return new Error("user id is missing");
//     const roomId = JSON.parse(roomObj).id;

//     socketRef.current.emit("game-state", {
//       newGameState: newArr,
//       room: roomId,
//       idOfUser: JSON.parse(userId),
//     });
//   };
//   // =====WORKING GAME STATE CHANGE!=========

//   // const setMyGuess = (agent: string) => {
//   //   const roomObj = localStorage.getItem("joinGame");
//   //   const userId = localStorage.getItem("myId");

//   //   if (!roomObj) {
//   //     console.error("Missing room ID");
//   //     return;
//   //   }
//   //   if (!userId) return new Error("user id is missing");
//   //   const roomId = JSON.parse(roomObj).id;
//   // };

//   return (
//     <>
//       {/* {fullDataGame && <NavBar gameData={fullDataGame} />} */}
//       {/* <Confetti active={false} /> */}
//       {fullDataGame && (
//         <VideoChat
//           roomId={fullDataGame.id}
//           refSocket={socketRef}
//           numPlayers={fullDataGame.players.length}
//           allGameData={fullDataGame}
//           setGameStateFunc={setFullDataGame}
//         />
//       )}

//       <div className="cardChatWrapper">
//         {fullDataGame ? (
//           <>
//             <CardPersonas
//               arrPersonas={personas}
//               pickFunction={pickPersona}
//               changePersonas={setPersonas}
//               fullData={fullDataGame}
//             />
//             <LiveChat
//               chatHistory={chatHistory}
//               sendMsgFunc={sendMsgFunc}
//               msgState={msgState}
//               setMsgState={setMsgState}
//               fullData={fullDataGame}
//             />

//             <GuessAgent
//               guessFunc={setGuessFunc}
//               roomId={fullDataGame.id}
//               playerArr={fullDataGame.players}
//             />
//           </>
//         ) : (
//           <Spiner />
//         )}
//       </div>
//     </>
//   );
// }

// export default Game;
// ========================================================================

import LiveChat from "../components/LiveChat";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import CardPersonas from "../components/CardPersonas";
import VideoChat from "../components/VideoChat";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Confetti from "../components/Confetti";
import GuessAgent from "../components/GuessAgent";
import Spiner from "../components/Spiner";
import DisclaimerPC from "../components/DisclaimerPC";

function Game() {
  const socketRef = useRef<any>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [msgState, setMsgState] = useState("");
  const [personas, setPersonas] = useState<any[]>([]);
  const [fullDataGame, setFullDataGame] = useState<any>(null);
  const [guess, setGuess] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (guess) {
      localStorage.removeItem("myId");
      disconectMsg();
      navigate(
        `/winner/${guess.userGuess.userIdWon}/${guess.userGuess.agent}/${guess.userGuess.userIdGuess}/${guess.userGuess.agentToGuess}`
      );
      return;
    }
  }, [guess]);

  useEffect(() => {
    console.log(guess, "TESTING THE GUESS");
  }, [guess]);

  useEffect(() => {
    const roomObj = localStorage.getItem("joinGame");
    const myIdObj = localStorage.getItem("myId");

    if (!roomObj) {
      console.error("Missing room ID");
      setConnectionError("Missing room ID. Please rejoin the game.");
      return;
    }

    if (!myIdObj) {
      console.error("Missing user ID");
      setConnectionError("Missing user ID. Please rejoin the game.");
      return;
    }

    const roomId = JSON.parse(roomObj).id;
    const myId = JSON.parse(myIdObj);
    const joinRoomObj = {
      roomId,
      myId,
    };

    // Enhanced socket connection with error handling
    try {
      socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
        query: { "x-api-key": `${import.meta.env.VITE_SECRET_KEY}` },
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Connection event handlers
      socketRef.current.on("connect", () => {
        console.log("Connected to server");
        setConnectionError(null);
      });

      socketRef.current.on("connect_error", (error: any) => {
        console.error("Connection error:", error);
        setConnectionError(`Connection failed: ${error.message}`);
      });

      socketRef.current.on("disconnect", (reason: string) => {
        console.log("Disconnected:", reason);
        if (reason === "io server disconnect") {
          // Server disconnected the client, try to reconnect manually
          socketRef.current.connect();
        }
      });

      socketRef.current.on("reconnect", (attemptNumber: number) => {
        console.log("Reconnected after", attemptNumber, "attempts");
        setConnectionError(null);
      });

      socketRef.current.on("reconnect_error", (error: any) => {
        console.error("Reconnection error:", error);
        setConnectionError(`Reconnection failed: ${error.message}`);
      });

      socketRef.current.on("join-room", (res: any) => {
        console.log(res, "JOIN ROOM RESPONSE");

        const player = res.players.find((player: any) => player.id === myId);
        const rawData = localStorage.getItem("joinGame");

        if (!rawData) return;
        const parsed = JSON.parse(rawData);

        if (player && res) {
          setPersonas(player.gameState);
          setFullDataGame(res);
          if (!parsed.players[1]) {
            localStorage.setItem("joinGame", JSON.stringify(res));
            console.log("Game data updated", res);
          }
        } else {
          console.error("Player not found in room or invalid response");
          setConnectionError("Failed to join room. Player not found.");
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
        console.log(state, "GAME STATE UPDATE");
        setFullDataGame(state);
      });

      socketRef.current.on("disconect-user", (msg: any) => {
        console.log(msg, "USER DISCONNECTED");
      });

      // Enhanced error handling for room join
      socketRef.current.on("join-room-error", (error: any) => {
        console.error("Join room error:", error);
        setConnectionError(`Failed to join room: ${error.message}`);
        navigate("/");
      });

      // Emit join room event
      socketRef.current.emit("join-room", joinRoomObj);
    } catch (error: any) {
      console.error("Socket initialization error:", error);
      setConnectionError(`Failed to initialize connection: ${error.message}`);
    }

    // Cleanup on unmount
    return () => {
      disconectMsg();
    };
  }, []);

  const setGuessFunc = (agentGuess: string) => {
    const roomObj = localStorage.getItem("joinGame");
    const myIdObj = localStorage.getItem("myId");

    if (!roomObj) {
      console.error("Missing room Obj");
      setConnectionError("Missing room data");
      return;
    }

    if (!myIdObj) {
      console.error("Missing room User ID");
      setConnectionError("Missing user data");
      return;
    }

    const roomObjj = JSON.parse(roomObj);
    const myIdObjj = JSON.parse(myIdObj);

    if (!fullDataGame || fullDataGame.id !== roomObjj.id) {
      console.error("Faulty Room ID");
      setConnectionError("Room ID mismatch");
      return;
    }

    const foundUser = fullDataGame.players.filter(
      (player: any) => player.id === myIdObjj
    );

    if (!foundUser[0]) {
      console.error("Faulty User ID");
      setConnectionError("User not found in room");
      return;
    }

    socketRef.current.emit("guess-agent", {
      roomId: fullDataGame.id,
      userId: foundUser[0].id,
      agent: agentGuess,
    });
  };

  const disconectMsg = () => {
    const lsMyIdData = localStorage.getItem("myId");
    if (!lsMyIdData) {
      console.log("Missing user ID for disconnect");
      return;
    }

    const parsedId = JSON.parse(lsMyIdData);
    if (!fullDataGame) return;

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("disconect-user", {
        gameRoom: fullDataGame.id,
        userId: parsedId,
        msg: "remove from database",
      });
    }

    // Properly disconnect the socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  // Enhanced message sending with error handling
  const sendMsgFunc = (stringMsg: string) => {
    const userId = localStorage.getItem("myId");
    const roomObj = localStorage.getItem("joinGame");
    const nameUserData = localStorage.getItem("myName");

    if (!roomObj) {
      console.error("Missing room ID");
      setConnectionError("Missing room data");
      return;
    }

    if (!userId) {
      console.error("User ID is missing");
      setConnectionError("Missing user data");
      return;
    }

    if (!nameUserData) {
      console.error("Name of Player is missing");
      setConnectionError("Missing player name");
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      console.error("Socket not connected");
      setConnectionError("Connection lost. Please refresh the page.");
      return;
    }

    const roomId = JSON.parse(roomObj).id;
    const nameOfUser = JSON.parse(nameUserData);

    const msgToSend = {
      room: roomId,
      userIo: JSON.parse(userId),
      sentMsg: stringMsg,
      nameOfUser,
    };

    try {
      socketRef.current.emit("send-message", msgToSend);
    } catch (error: any) {
      console.error("Error sending message:", error);
      setConnectionError("Failed to send message");
    }
  };

  // Enhanced persona picking with error handling
  const pickPersona = (newArr: any[]) => {
    const roomObj = localStorage.getItem("joinGame");
    const userId = localStorage.getItem("myId");

    if (!roomObj) {
      console.error("Missing room ID");
      setConnectionError("Missing room data");
      return;
    }

    if (!userId) {
      console.error("User ID is missing");
      setConnectionError("Missing user data");
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      console.error("Socket not connected");
      setConnectionError("Connection lost. Please refresh the page.");
      return;
    }

    const roomId = JSON.parse(roomObj).id;

    try {
      socketRef.current.emit("game-state", {
        newGameState: newArr,
        room: roomId,
        idOfUser: JSON.parse(userId),
      });
    } catch (error: any) {
      console.error("Error updating game state:", error);
      setConnectionError("Failed to update game state");
    }
  };

  // Error display component
  if (connectionError) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          backgroundColor: "#ffebee",
          border: "1px solid #f44336",
          borderRadius: "4px",
          margin: "20px",
        }}
      >
        <h3 style={{ color: "#d32f2f" }}>Connection Error</h3>
        <p>{connectionError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <>
      <DisclaimerPC />
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
        {fullDataGame ? (
          <>
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
              fullData={fullDataGame}
            />
            <GuessAgent
              guessFunc={setGuessFunc}
              roomId={fullDataGame.id}
              playerArr={fullDataGame.players}
            />
          </>
        ) : (
          <Spiner />
        )}
      </div>
    </>
  );
}

export default Game;
