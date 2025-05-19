const express = require("express");
const cors = require("cors");
const app = express();
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
const url = "http://localhost:5000";
const theRealKey = "open-sesame";

app.use(express.json());
app.use(cors());

// ================MIDDLEWARE FOR KEY=================
const validateKey = (req, res, next) => {
  const theKey = req.header("x-api-key");

  if (!theKey) {
    return res.status(403).json({ error: "API key is required" });
  }
  if (theKey !== theRealKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  next();
};
// ================MIDDLEWARE FOR KEY=================

// ===============CUSTOM MIDDLEWARE================

const isCreateValid = (req, res, next) => {
  const data = req.body;
  if (!data.roomName || !data.roomPassword || !data.usernameDb) {
    return res.status(401).json({ error: "Invalid Data Recived" });
  }
  next();
};

// ===============CUSTOM MIDDLEWARE================

app.get("/gameOn", validateKey, async (req, res) => {
  try {
    const response = await fetch(`${url}/games`);
    const data = await response.json();

    res.send(data);
  } catch {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/agentsList", validateKey, async (req, res) => {
  try {
    const resp = await fetch(`${url}/personas`);
    const agentsData = await resp.json();

    res.send(agentsData);
  } catch {
    console.error("Failed to fetch agents list data:", error);
    res.status(500).json({ error: "Failed to fetch agents list data" });
  }
});

app.post("/createRoom", validateKey, isCreateValid, async (req, res) => {
  const data = req.body;

  try {
    // Fetch existing games to check for room name conflict
    const response = await fetch(`${url}/games`);
    const dataDb = await response.json();
    const foundRoom = dataDb.some((room) => room.roomName === data.roomName);

    // const futureRoom = dataDb.length + 1;

    // if (futureRoom - 2 >= 0) {
    //   const idToDel = dataDb[futureRoom - 2].id;
    //   console.log(idToDel, "has been deleted");
    //   fetch(`${url}/games/${idToDel}`, {
    //     method: "DELETE",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    // }
    if (foundRoom) {
      // Check if the room name already exists
      return res
        .status(400)
        .send("Room name already exists. Please choose a different name.");
    }

    // Fetch personas for random selection
    const personaRes = await fetch(`${url}/personas`);
    const personaData = await personaRes.json();

    const idOfGame = uuidv4();
    const idOfUser = uuidv4();
    const newGame = {
      id: idOfGame,
      roomName: data.roomName,
      roomPassword: data.roomPassword,
      players: [
        {
          id: idOfUser, // Use function call to generate unique ID
          usernameDb: data.usernameDb,
          online: true,
          myPerson:
            personaData[Math.floor(Math.random() * personaData.length)].name, // Correctly access name property
          endPick: null,
          gameState: personaData,
        },
      ],
      turn: idOfUser,
      winner: null,
      chat: [],
    };

    // ===========WORKING==================

    const futureRoom = dataDb.length + 1;
    if (!(futureRoom - 3 >= 0)) {
      const postResponse = await fetch(`${url}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGame),
      });

      if (!postResponse.ok) {
        throw new Error("Failed to create a new game");
      }
      const createdGame = await postResponse.json();
      res.status(201).json(createdGame);
      return;
    }
    const idToDel = dataDb[futureRoom - 3].id;

    const deleteStaleGame = await fetch(`${url}/games/${idToDel}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (deleteStaleGame.ok) {
      const postResponse = await fetch(`${url}/games`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGame),
      });

      if (!postResponse.ok) {
        throw new Error("Failed to create a new game");
      }

      const createdGame = await postResponse.json();

      res.status(201).json(createdGame);
    }
    // ===========WORKING==================

    // // Post the new game to the JSON server
    // const postResponse = await fetch(`${url}/games`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(newGame), // Convert newGame object to JSON string
    // });

    // // Check if the POST request was successful
    // if (!postResponse.ok) {
    //   throw new Error("Failed to create a new game");
    // }

    // const createdGame = await postResponse.json(); // Get the newly created game object

    // res.status(201).json(createdGame); // Respond with the created game
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }

  // console.log(data, "DATA FROM FRONT END");
});

app.post("/leave-game", validateKey, async (req, res) => {
  console.log(req.body);
  const idRoom = req.body.roomId;
  const idUser = req.body.userId;

  const gameData = await fetchRoom(idRoom);

  if (!gameData) res.send({ msg: "not good" });

  const showData = removePlayerById(gameData, idUser);

  if (showData.players.length === 0) {
    fetch(`${url}/games/${idRoom}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    fetch(`${url}/games/${idRoom}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(showData),
    });
  }

  // console.log(showData);
  res.send({ canLeave: true, newData: showData });
});

app.put("/joinRoom", validateKey, isCreateValid, async (req, res) => {
  const { roomName, roomPassword, usernameDb } = req.body;

  try {
    const response = await fetch(`${url}/games`);
    const data = await response.json();

    const foundRoom = data.find(
      (room) =>
        room.roomName === roomName &&
        room.roomPassword === roomPassword &&
        room.players.length <= 1
    );

    if (foundRoom) {
      const personaRes = await fetch(`${url}/personas`);
      const personaData = await personaRes.json();

      const addNewPlayer = {
        id: uuidv4(),
        usernameDb: usernameDb,
        online: true,
        myPerson:
          personaData[Math.floor(Math.random() * personaData.length)].name,
        endPick: null,
        gameState: personaData,
      };

      foundRoom.players.push(addNewPlayer);

      const resUpdate = await fetch(`${url}/games/${foundRoom.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(foundRoom),
      });
      if (!resUpdate.ok) {
        throw new Error("Failed to update room");
      }

      return res.send(foundRoom);
    }

    return res.status(400).send({ message: "access denied" });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

const httpSrw = app.listen(3000, () => {
  console.log("server on port 3000");
});

// ======SOKCET MIDDLEWARE======

const validateSocketKey = (socket, next) => {
  const theKey = socket.handshake.query["x-api-key"];

  if (!theKey) return next(new Error("Need API-Key to Connect :)"));

  if (theKey !== theRealKey) return next(new Error("Key is not Correct :)"));

  next();
};

// ======SOKCET MIDDLEWARE======

// ==========MY FUNCTIONS=======

const getGameStart = async (idRoom, userId) => {
  try {
    // const response = await fetch(`${url}/games/${idRoom}`);
    // const data = await response.json();
    const data = await fetchRoom(idRoom);

    return data.players.some((player) => player.id === userId);
  } catch (error) {
    return false;
  }
};

const fetchRoom = async (gameId) => {
  try {
    const response = await fetch(`${url}/games/${gameId}`);
    const data = await response.json();

    return data;
  } catch (err) {
    return err;
  }
};

const removePlayerById = (gameData, playerId) => {
  return {
    ...gameData,
    players: gameData.players.filter((player) => player.id !== playerId),
  };
};
// ==========MY FUNCTIONS=======

// ======================Socket logic==========

const io = new Server(httpSrw, {
  cors: {
    origin: "*",
    methods: "*",
  },
});
io.use(validateSocketKey);

io.on("connection", (socket) => {
  // console.log(socket.id);

  socket.on("disconnect", () => {
    console.log(`USER HAS DISCONNECTED: ${socket.id}`);
  });

  socket.on("disconect-user", (data) => {
    // io.to(data.gameRoom).emit("disconect-user", data);
    console.log(data);
  });

  socket.on("join-room", async (room) => {
    const isPlayerInGame = await getGameStart(room.roomId, room.myId);

    if (isPlayerInGame) {
      try {
        const gameResponse = await fetch(`${url}/games/${room.roomId}`);
        const gameData = await gameResponse.json();

        socket.join(room.roomId);
        io.to(room.roomId).emit("join-room", gameData);
        // console.log(room, "HERE");
      } catch (error) {
        console.log("error finding game Data", error);
        socket.disconnect();
      }
    } else {
      console.log(`User ${room.myId} is not part of game ${room.roomId}`);
      socket.disconnect();
    }
  });

  // socket.on("guess-agent", async (gameDataFe) => {
  //   try {
  //     const { roomId, userId, agent } = gameDataFe;
  //     const fetchedRoomData = await fetchRoom(roomId); //CHECK IF WE NEED AWAIT

  //     const newData = {
  //       id: fetchedRoomData.id,
  //       roomName: fetchedRoomData.roomName,
  //       roomPassword: fetchedRoomData.roomPassword,
  //       players: [], //WE MIGHT GET BUGS
  //       turn: null,
  //       winner: null,
  //       userGuess: {
  //         userIdGuess: userId,
  //         agent,
  //       },
  //     };

  //     const updateResponse = await fetch(`${url}/games/${roomId}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(gameData), // Send the updated game data back to the server
  //     });
  //     io.to(gameDataFe.roomId).emit("guess-agent", {
  //       msg: "TESTING GUESS",
  //       roomId,
  //       userId,
  //       agent,
  //     });
  //   } catch {}

  //   console.log({ msg: "TESTING GUESS", gameDataFe });
  // });

  socket.on("guess-agent", async (gameDataFe) => {
    try {
      const { roomId, userId, agent } = gameDataFe;
      const fetchedRoomData = await fetchRoom(roomId);

      if (userId !== fetchedRoomData.turn) return;
      // Identify opponent
      const opponent = fetchedRoomData.players.find((p) => p.id !== userId);
      const guessUserPlayer = fetchedRoomData.players.find(
        (p) => p.id === userId
      );
      if (!opponent) {
        console.error("Opponent not found");
        return;
      }

      // Check if the guess is correct
      const isCorrectGuess = opponent.myPerson === agent;

      const newData = {
        ...fetchedRoomData,
        players: [],
        winner: isCorrectGuess
          ? guessUserPlayer.usernameDb
          : opponent.usernameDb,
        userGuess: {
          userIdGuess: userId,
          agent,
          userIdWon: isCorrectGuess ? guessUserPlayer.id : opponent.id,
        },
      };

      // Update backend
      // const updateResponse = await fetch(`${url}/games/${roomId}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(newData),
      // });
      const updateResponse = await fetch(`${url}/games/${roomId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      // Emit result to room
      // io.to(roomId).emit("guess-agent", {
      //   msg: isCorrectGuess ? "Correct guess!" : "Wrong guess!",
      //   correct: isCorrectGuess,
      //   winner: isCorrectGuess ? userId : null,
      //   roomId,
      //   userId,
      //   agent,
      // });
      io.to(roomId).emit("guess-agent", newData);
    } catch (error) {
      console.error("Error in guess-agent handler:", error);
    }
  });

  socket.on("send-message", (msg) => {
    io.to(msg.room).emit("send-message", msg);
    console.log(msg);
  });

  socket.on("game-state", async (state) => {
    try {
      // Fetch the current game data from the database using the room ID
      const gameResponse = await fetch(`${url}/games/${state.room}`);
      const gameData = await gameResponse.json();

      // Find the player based on the provided user ID (state.idOfUser)
      const playerIndex = gameData.players.findIndex(
        (player) => player.id === state.idOfUser
      );

      if (playerIndex !== -1) {
        // Update the game state for the specific user
        gameData.players[playerIndex].gameState = state.newGameState;
        gameData.turn =
          gameData.players[0].id === gameData.turn
            ? gameData.players[1].id
            : gameData.players[0].id;

        // Optionally, update the game data in the database
        const updateResponse = await fetch(`${url}/games/${state.room}`, {
          method: "PUT", // You can also use 'PATCH' depending on your API
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gameData), // Send the updated game data back to the server
        });

        if (updateResponse.ok) {
          // Emit the updated game state to the room to notify all players
          io.to(state.room).emit("game-state", gameData);
          console.log("Updated game state:", gameData);
        } else {
          console.error("Failed to update game state in the database");
        }
      } else {
        console.error("Player not found in the game data");
      }
    } catch (error) {
      console.error("Error fetching or updating game state:", error);
    }
  });

  socket.on("offer", async (offer) => {
    const isPlayerInGame = await getGameStart(offer.room, offer.myId);
    if (isPlayerInGame) {
      socket.broadcast.to(offer.room).emit("offer", offer.data);
      console.log("OFFER sent to room:", offer);
    } else {
      console.log(`User ${offer.myId} is not part of game ${offer.room}`);
      socket.disconnect();
    }
  });

  // Handle answer
  socket.on("answer", async (answer) => {
    const isPlayerInGame = await getGameStart(answer.room, answer.myId);
    if (isPlayerInGame) {
      socket.broadcast.to(answer.room).emit("answer", answer.data);
      console.log("ANSWER sent to room:", answer);
    } else {
      console.log(`User ${answer.myId} is not part of game ${answer.room}`);
      socket.disconnect();
    }
  });

  // Handle ICE candidate
  socket.on("candidate", async (candidate) => {
    const isPlayerInGame = await getGameStart(candidate.room, candidate.myId);
    if (isPlayerInGame) {
      socket.broadcast.to(candidate.room).emit("candidate", candidate.data);
      console.log("CANDIDATE sent to room:", candidate);
    } else {
      console.log(
        `User ${candidate.myId} is not part of game ${candidate.room}`
      );
      socket.disconnect();
    }
  });
});

// ======================Socket logic==========
