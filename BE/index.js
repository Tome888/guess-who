// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const app = express();
// const { v4: uuidv4 } = require("uuid");
// const { Server } = require("socket.io");
// // const url = "http://localhost:5000";
// const url = process.env.DB_URL;

// // const theRealKey = process.env.SECRET_KEY || "open-sesame";
// const theRealKey = process.env.SECRET_KEY;

// const PORT = process.env.PORT || 3000;

// app.use(express.json());
// app.use(cors());

// // ================MIDDLEWARE FOR KEY=================
// const validateKey = (req, res, next) => {
//   const theKey = req.header("x-api-key");

//   if (!theKey) {
//     return res.status(403).json({ error: "API key is required" });
//   }
//   if (theKey !== theRealKey) {
//     return res.status(401).json({ error: "Invalid API key" });
//   }
//   next();
// };
// // ================MIDDLEWARE FOR KEY=================

// // ===============CUSTOM MIDDLEWARE================

// const isCreateValid = (req, res, next) => {
//   const data = req.body;
//   if (!data.roomName || !data.roomPassword || !data.usernameDb) {
//     return res.status(401).json({ error: "Invalid Data Recived" });
//   }
//   next();
// };

// // ===============CUSTOM MIDDLEWARE================

// app.get("/gameOn", validateKey, async (req, res) => {
//   try {
//     const response = await fetch(`${url}/games`);
//     const data = await response.json();

//     res.send(data);
//   } catch {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// app.get("/agentsList", validateKey, async (req, res) => {
//   try {
//     const resp = await fetch(`${url}/personas`);
//     const agentsData = await resp.json();

//     res.send(agentsData);
//   } catch {
//     console.error("Failed to fetch agents list data:", error);
//     res.status(500).json({ error: "Failed to fetch agents list data" });
//   }
// });

// app.post("/createRoom", validateKey, isCreateValid, async (req, res) => {
//   const data = req.body;

//   try {
//     // Fetch existing games to check for room name conflict
//     const response = await fetch(`${url}/games`);
//     const dataDb = await response.json();
//     const foundRoom = dataDb.some((room) => room.roomName === data.roomName);

//     // const futureRoom = dataDb.length + 1;

//     // if (futureRoom - 2 >= 0) {
//     //   const idToDel = dataDb[futureRoom - 2].id;
//     //   console.log(idToDel, "has been deleted");
//     //   fetch(`${url}/games/${idToDel}`, {
//     //     method: "DELETE",
//     //     headers: {
//     //       "Content-Type": "application/json",
//     //     },
//     //   });
//     // }
//     if (foundRoom) {
//       // Check if the room name already exists
//       return res
//         .status(400)
//         .send("Room name already exists. Please choose a different name.");
//     }

//     // Fetch personas for random selection
//     const personaRes = await fetch(`${url}/personas`);
//     const personaData = await personaRes.json();

//     const idOfGame = uuidv4();
//     const idOfUser = uuidv4();
//     const newGame = {
//       id: idOfGame,
//       roomName: data.roomName,
//       roomPassword: data.roomPassword,
//       players: [
//         {
//           id: idOfUser, // Use function call to generate unique ID
//           usernameDb: data.usernameDb,
//           online: true,
//           myPerson:
//             personaData[Math.floor(Math.random() * personaData.length)].name, // Correctly access name property
//           endPick: null,
//           gameState: personaData,
//         },
//       ],
//       turn: idOfUser,
//       winner: null,
//       chat: [],
//     };

//     // ===========WORKING==================

//     const futureRoom = dataDb.length + 1;
//     if (!(futureRoom - 3 >= 0)) {
//       const postResponse = await fetch(`${url}/games`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newGame),
//       });

//       if (!postResponse.ok) {
//         throw new Error("Failed to create a new game");
//       }
//       const createdGame = await postResponse.json();
//       res.status(201).json(createdGame);
//       return;
//     }
//     const idToDel = dataDb[futureRoom - 3].id;

//     const deleteStaleGame = await fetch(`${url}/games/${idToDel}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     if (deleteStaleGame.ok) {
//       const postResponse = await fetch(`${url}/games`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(newGame),
//       });

//       if (!postResponse.ok) {
//         throw new Error("Failed to create a new game");
//       }

//       const createdGame = await postResponse.json();

//       res.status(201).json(createdGame);
//     }
//     // ===========WORKING==================

//     // // Post the new game to the JSON server
//     // const postResponse = await fetch(`${url}/games`, {
//     //   method: "POST",
//     //   headers: {
//     //     "Content-Type": "application/json",
//     //   },
//     //   body: JSON.stringify(newGame), // Convert newGame object to JSON string
//     // });

//     // // Check if the POST request was successful
//     // if (!postResponse.ok) {
//     //   throw new Error("Failed to create a new game");
//     // }

//     // const createdGame = await postResponse.json(); // Get the newly created game object

//     // res.status(201).json(createdGame); // Respond with the created game
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }

//   // console.log(data, "DATA FROM FRONT END");
// });

// app.post("/leave-game", validateKey, async (req, res) => {
//   console.log(req.body);
//   const idRoom = req.body.roomId;
//   const idUser = req.body.userId;

//   const gameData = await fetchRoom(idRoom);

//   if (!gameData) res.send({ msg: "not good" });

//   const showData = removePlayerById(gameData, idUser);

//   if (showData.players.length === 0) {
//     fetch(`${url}/games/${idRoom}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } else {
//     fetch(`${url}/games/${idRoom}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(showData),
//     });
//   }

//   // console.log(showData);
//   res.send({ canLeave: true, newData: showData });
// });

// app.put("/joinRoom", validateKey, isCreateValid, async (req, res) => {
//   const { roomName, roomPassword, usernameDb } = req.body;

//   try {
//     const response = await fetch(`${url}/games`);
//     const data = await response.json();

//     const foundRoom = data.find(
//       (room) =>
//         room.roomName === roomName &&
//         room.roomPassword === roomPassword &&
//         room.players.length <= 1
//     );

//     if (foundRoom) {
//       const personaRes = await fetch(`${url}/personas`);
//       const personaData = await personaRes.json();

//       const addNewPlayer = {
//         id: uuidv4(),
//         usernameDb: usernameDb,
//         online: true,
//         myPerson:
//           personaData[Math.floor(Math.random() * personaData.length)].name,
//         endPick: null,
//         gameState: personaData,
//       };

//       foundRoom.players.push(addNewPlayer);

//       const resUpdate = await fetch(`${url}/games/${foundRoom.id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(foundRoom),
//       });
//       if (!resUpdate.ok) {
//         throw new Error("Failed to update room");
//       }

//       return res.send(foundRoom);
//     }

//     return res.status(400).send({ message: "access denied" });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// const httpSrw = app.listen(PORT, () => {
//   console.log(`server on port ${PORT}`);
// });

// // ======SOKCET MIDDLEWARE======

// const validateSocketKey = (socket, next) => {
//   const theKey = socket.handshake.query["x-api-key"];

//   if (!theKey) return next(new Error("Need API-Key to Connect :)"));

//   if (theKey !== theRealKey) return next(new Error("Key is not Correct :)"));

//   next();
// };

// // ======SOKCET MIDDLEWARE======

// // ==========MY FUNCTIONS=======

// const getGameStart = async (idRoom, userId) => {
//   try {
//     // const response = await fetch(`${url}/games/${idRoom}`);
//     // const data = await response.json();
//     const data = await fetchRoom(idRoom);

//     return data.players.some((player) => player.id === userId);
//   } catch (error) {
//     return false;
//   }
// };

// const fetchRoom = async (gameId) => {
//   try {
//     const response = await fetch(`${url}/games/${gameId}`);
//     const data = await response.json();

//     return data;
//   } catch (err) {
//     return err;
//   }
// };

// const removePlayerById = (gameData, playerId) => {
//   return {
//     ...gameData,
//     players: gameData.players.filter((player) => player.id !== playerId),
//   };
// };
// // ==========MY FUNCTIONS=======

// // ======================Socket logic==========

// const io = new Server(httpSrw, {
//   cors: {
//     origin: "*",
//     methods: "*",
//   },
// });
// io.use(validateSocketKey);

// io.on("connection", (socket) => {
//   // console.log(socket.id);

//   socket.on("disconnect", () => {
//     console.log(`USER HAS DISCONNECTED: ${socket.id}`);
//   });

//   socket.on("disconect-user", (data) => {
//     // io.to(data.gameRoom).emit("disconect-user", data);
//     console.log(data);
//   });

//   socket.on("join-room", async (room) => {
//     const isPlayerInGame = await getGameStart(room.roomId, room.myId);

//     if (isPlayerInGame) {
//       try {
//         const gameResponse = await fetch(`${url}/games/${room.roomId}`);
//         const gameData = await gameResponse.json();

//         socket.join(room.roomId);
//         io.to(room.roomId).emit("join-room", gameData);
//         // console.log(room, "HERE");
//       } catch (error) {
//         console.log("error finding game Data", error);
//         socket.disconnect();
//       }
//     } else {
//       console.log(`User ${room.myId} is not part of game ${room.roomId}`);
//       socket.disconnect();
//     }
//   });

//   // socket.on("guess-agent", async (gameDataFe) => {
//   //   try {
//   //     const { roomId, userId, agent } = gameDataFe;
//   //     const fetchedRoomData = await fetchRoom(roomId); //CHECK IF WE NEED AWAIT

//   //     const newData = {
//   //       id: fetchedRoomData.id,
//   //       roomName: fetchedRoomData.roomName,
//   //       roomPassword: fetchedRoomData.roomPassword,
//   //       players: [], //WE MIGHT GET BUGS
//   //       turn: null,
//   //       winner: null,
//   //       userGuess: {
//   //         userIdGuess: userId,
//   //         agent,
//   //       },
//   //     };

//   //     const updateResponse = await fetch(`${url}/games/${roomId}`, {
//   //       method: "PUT",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify(gameData), // Send the updated game data back to the server
//   //     });
//   //     io.to(gameDataFe.roomId).emit("guess-agent", {
//   //       msg: "TESTING GUESS",
//   //       roomId,
//   //       userId,
//   //       agent,
//   //     });
//   //   } catch {}

//   //   console.log({ msg: "TESTING GUESS", gameDataFe });
//   // });

//   socket.on("guess-agent", async (gameDataFe) => {
//     try {
//       const { roomId, userId, agent } = gameDataFe;
//       const fetchedRoomData = await fetchRoom(roomId);

//       if (userId !== fetchedRoomData.turn) return;
//       // Identify opponent
//       const opponent = fetchedRoomData.players.find((p) => p.id !== userId);
//       const guessUserPlayer = fetchedRoomData.players.find(
//         (p) => p.id === userId
//       );
//       if (!opponent) {
//         console.error("Opponent not found");
//         return;
//       }

//       // Check if the guess is correct
//       const isCorrectGuess = opponent.myPerson === agent;

//       const newData = {
//         ...fetchedRoomData,
//         players: [],
//         winner: isCorrectGuess
//           ? guessUserPlayer.usernameDb
//           : opponent.usernameDb,
//         userGuess: {
//           userIdGuess: userId,
//           agent,
//           userIdWon: isCorrectGuess ? guessUserPlayer.id : opponent.id,
//         },
//       };

//       // Update backend
//       // const updateResponse = await fetch(`${url}/games/${roomId}`, {
//       //   method: "PUT",
//       //   headers: {
//       //     "Content-Type": "application/json",
//       //   },
//       //   body: JSON.stringify(newData),
//       // });
//       const updateResponse = await fetch(`${url}/games/${roomId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       // Emit result to room
//       // io.to(roomId).emit("guess-agent", {
//       //   msg: isCorrectGuess ? "Correct guess!" : "Wrong guess!",
//       //   correct: isCorrectGuess,
//       //   winner: isCorrectGuess ? userId : null,
//       //   roomId,
//       //   userId,
//       //   agent,
//       // });
//       io.to(roomId).emit("guess-agent", newData);
//     } catch (error) {
//       console.error("Error in guess-agent handler:", error);
//     }
//   });

//   socket.on("send-message", (msg) => {
//     io.to(msg.room).emit("send-message", msg);
//     console.log(msg);
//   });

//   socket.on("game-state", async (state) => {
//     try {
//       // Fetch the current game data from the database using the room ID
//       const gameResponse = await fetch(`${url}/games/${state.room}`);
//       const gameData = await gameResponse.json();

//       // Find the player based on the provided user ID (state.idOfUser)
//       const playerIndex = gameData.players.findIndex(
//         (player) => player.id === state.idOfUser
//       );

//       if (playerIndex !== -1) {
//         // Update the game state for the specific user
//         gameData.players[playerIndex].gameState = state.newGameState;
//         gameData.turn =
//           gameData.players[0].id === gameData.turn
//             ? gameData.players[1].id
//             : gameData.players[0].id;

//         // Optionally, update the game data in the database
//         const updateResponse = await fetch(`${url}/games/${state.room}`, {
//           method: "PUT", // You can also use 'PATCH' depending on your API
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(gameData), // Send the updated game data back to the server
//         });

//         if (updateResponse.ok) {
//           // Emit the updated game state to the room to notify all players
//           io.to(state.room).emit("game-state", gameData);
//           console.log("Updated game state:", gameData);
//         } else {
//           console.error("Failed to update game state in the database");
//         }
//       } else {
//         console.error("Player not found in the game data");
//       }
//     } catch (error) {
//       console.error("Error fetching or updating game state:", error);
//     }
//   });

//   socket.on("offer", async (offer) => {
//     const isPlayerInGame = await getGameStart(offer.room, offer.myId);
//     if (isPlayerInGame) {
//       socket.broadcast.to(offer.room).emit("offer", offer.data);
//       console.log("OFFER sent to room:", offer);
//     } else {
//       console.log(`User ${offer.myId} is not part of game ${offer.room}`);
//       socket.disconnect();
//     }
//   });

//   // Handle answer
//   socket.on("answer", async (answer) => {
//     const isPlayerInGame = await getGameStart(answer.room, answer.myId);
//     if (isPlayerInGame) {
//       socket.broadcast.to(answer.room).emit("answer", answer.data);
//       console.log("ANSWER sent to room:", answer);
//     } else {
//       console.log(`User ${answer.myId} is not part of game ${answer.room}`);
//       socket.disconnect();
//     }
//   });

//   // Handle ICE candidate
//   socket.on("candidate", async (candidate) => {
//     const isPlayerInGame = await getGameStart(candidate.room, candidate.myId);
//     if (isPlayerInGame) {
//       socket.broadcast.to(candidate.room).emit("candidate", candidate.data);
//       console.log("CANDIDATE sent to room:", candidate);
//     } else {
//       console.log(
//         `User ${candidate.myId} is not part of game ${candidate.room}`
//       );
//       socket.disconnect();
//     }
//   });
// });

// // ======================Socket logic==========

// MONGOMONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;MONGO;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");
// const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const url = process.env.DB_URL;

// const theRealKey = process.env.SECRET_KEY || "open-sesame";
const theRealKey = process.env.SECRET_KEY;
const mongoUrl = process.env.MONGO_DB_URL;

const PORT = process.env.PORT || 3000;

let db = null;

app.use(express.json());
app.use(cors());

// =========MONGO CONNECTION===========
MongoClient.connect(mongoUrl)
  .then((client) => {
    db = client.db("Guess_Who_DB"); // Replace with your database name
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => console.error("❌ Connection error:", err));

// =========MONGO CONNECTION===========

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

// #MONGO
app.get("/ping-pong", async (req, res) => {
  try {
    const resultDb = await db.collection("pingCall").findOne({});
    const okResult = await resultDb.result;
    res.send(okResult);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Failed to fetch result" });
  }
});

// app.get("/gameOn", validateKey, async (req, res) => {
//   try {
//     const response = await fetch(`${url}/games`);
//     const data = await response.json();

//     res.send(data);
//   } catch {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Failed to fetch data" });
//   }
// });

// #MONGO
app.get("/agentsList", validateKey, async (req, res) => {
  try {
    const items = await db.collection("personas").find({}).toArray();

    res.json(items[0].personas);
  } catch (error) {
    console.error("Failed to fetch agents list data:", error);
    res.status(500).json({ error: "Failed to fetch agents list data" });
  }
});

// #MONGO
app.post("/createRoom", validateKey, isCreateValid, async (req, res) => {
  const data = req.body;

  try {
    const gamesAlive = await getAnyDb("games");
    // console.log(gamesAlive);
    const dataDb = gamesAlive;
    const foundRoom = dataDb.some((room) => room.roomName === data.roomName);

    if (foundRoom) {
      // Check if the room name already exists
      return res
        .status(400)
        .send("Room name already exists. Please choose a different name.");
    }

    const rawPersonasData = await getAnyDb("personas");
    const personaData = rawPersonasData[0].personas;

    const idOfGame = uuidv4();
    const idOfUser = uuidv4();

    const newGame = {
      id: idOfGame,
      createdAt: new Date(),
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

    const MAX_GAMES = 3;

    const gamesCollection = db.collection("games"); // or use Mongoose model

    const currentGameCount = await gamesCollection.countDocuments();

    if (currentGameCount >= MAX_GAMES) {
      // Find and delete the oldest game (based on createdAt or _id)
      const oldestGame = await gamesCollection
        .find()
        .sort({ createdAt: 1 })
        .limit(1)
        .toArray();
      if (oldestGame[0]) {
        await gamesCollection.deleteOne({ _id: oldestGame[0]._id });
      }
    }

    // Insert the new game

    const result = await gamesCollection.insertOne(newGame);
    newGame._id = result.insertedId;
    res.send(newGame);

    // ===========WORKING==================
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }

  // console.log(data, "DATA FROM FRONT END");
});

// #MONGO
app.post("/leave-game", validateKey, async (req, res) => {
  try {
    const { roomId: idRoom, userId: idUser } = req.body;
    const gamesCollection = db.collection("games");

    // Find the game by roomId
    const gameData = await gamesCollection.findOne({ id: idRoom });
    if (!gameData) {
      return res.status(404).send({ msg: "Room not found" });
    }

    // Remove the player by userId from players array
    const updatedPlayers = gameData.players.filter(
      (player) => player.id !== idUser
    );

    if (updatedPlayers.length === 0) {
      // No players left, delete the game document
      const deleteResult = await gamesCollection.deleteOne({ id: idRoom });
      if (deleteResult.deletedCount === 1) {
        return res.send({
          canLeave: true,
          msg: "Room deleted because no players left",
        });
      } else {
        throw new Error("Failed to delete the empty room");
      }
    } else {
      // Update the game document with new players array
      const updateResult = await gamesCollection.updateOne(
        { id: idRoom },
        { $set: { players: updatedPlayers } }
      );

      if (updateResult.modifiedCount === 1) {
        return res.send({
          canLeave: true,
          newData: { ...gameData, players: updatedPlayers },
        });
      } else {
        throw new Error("Failed to update the room players");
      }
    }
  } catch (error) {
    console.error("Error in leave-game:", error);
    res.status(500).send({ msg: "Something went wrong" });
  }
});
// app.post("/leave-game", validateKey, async (req, res) => {
//   try {
//     const { roomId: idRoom, userId: idUser } = req.body;
//     const gamesCollection = db.collection("games");

//     // Find the game by roomId
//     const gameData = await gamesCollection.findOne({ id: idRoom });
//     if (!gameData) {
//       return res.status(404).send({ msg: "Room not found" });
//     }

//     // Update the online status of the user to false
//     const updatedPlayers = gameData.players.map((player) => {
//       if (player.id === idUser) {
//         return { ...player, online: false };
//       }
//       return player;
//     });

//     // Check if all players are offline
//     const allOffline = updatedPlayers.every((player) => !player.online);

//     if (allOffline) {
//       // Delete the game if both players are offline
//       const deleteResult = await gamesCollection.deleteOne({ id: idRoom });
//       if (deleteResult.deletedCount === 1) {
//         return res.send({
//           canLeave: true,
//           msg: "Both players offline — room deleted.",
//         });
//       } else {
//         throw new Error("Failed to delete the room");
//       }
//     } else {
//       // Update the game with new player statuses
//       const updateResult = await gamesCollection.updateOne(
//         { id: idRoom },
//         { $set: { players: updatedPlayers } }
//       );

//       if (updateResult.modifiedCount === 1) {
//         return res.send({
//           canLeave: true,
//           msg: "User marked offline",
//           newData: { ...gameData, players: updatedPlayers },
//         });
//       } else {
//         throw new Error("Failed to update player online status");
//       }
//     }
//   } catch (error) {
//     console.error("Error in leave-game:", error);
//     res.status(500).send({ msg: "Something went wrong" });
//   }
// });
// #MONGO
app.put("/joinRoom", validateKey, isCreateValid, async (req, res) => {
  const { roomName, roomPassword, usernameDb } = req.body;

  try {
    const gamesCollection = db.collection("games");

    // 1. Find the room with space for one more player
    const foundRoom = await gamesCollection.findOne({
      roomName,
      roomPassword,
      $expr: { $lte: [{ $size: "$players" }, 1] }, // players.length <= 1
    });

    if (!foundRoom) {
      return res.status(400).send({ message: "access denied" });
    }

    // 2. Check if username already exists in the room
    const isUsernameTaken = foundRoom.players.some(
      (player) => player.usernameDb === usernameDb
    );

    if (isUsernameTaken) {
      return res
        .status(400)
        .json({ message: "Username already taken in room" });
    }

    // 3. Get all personas
    const myPersons = await getAnyDb("personas");
    const personaData = await myPersons[0].personas;
    if (!personaData.length) {
      return res.status(500).json({ error: "No personas available" });
    }

    const idOfUser = uuidv4();
    // 4. Add new player
    const newPlayer = {
      id: idOfUser,
      usernameDb,
      online: true,
      myPerson:
        personaData[Math.floor(Math.random() * personaData.length)].name,
      endPick: null,
      gameState: personaData,
    };

    // 5. Update the game document by adding the new player
    const updateResult = await gamesCollection.updateOne(
      { _id: foundRoom._id },
      { $push: { players: newPlayer } }
    );

    if (!updateResult.modifiedCount) {
      throw new Error("Failed to update room");
    }

    // 6. Send updated room back
    const updatedRoom = await gamesCollection.findOne({ _id: foundRoom._id });
    res.send(updatedRoom);
  } catch (error) {
    console.error("Error joining room:", error);
    res.status(500).json({ error: "Failed to join room" });
  }
});
// app.put("/joinRoom", validateKey, isCreateValid, async (req, res) => {
//   const { roomName, roomPassword, usernameDb } = req.body;

//   try {
//     const gamesCollection = db.collection("games");

//     const foundRoom = await gamesCollection.findOne({
//       roomName,
//       roomPassword, // players.length <= 1
//     });

//     if (!foundRoom) return res.status(400).send({ message: "access denied" });

//     if (foundRoom.players.length <= 1) {
//       const isUsernameTaken = foundRoom.players.some(
//         (player) => player.usernameDb === usernameDb
//       );
//       if (isUsernameTaken) {
//         return res
//           .status(400)
//           .json({ message: "Username already taken in room" });
//       }

//       const myPersons = await getAnyDb("personas");
//       const personaData = await myPersons[0].personas;
//       if (!personaData.length) {
//         return res.status(500).json({ error: "No personas available" });
//       }

//       const idOfUser = uuidv4();
//       // 4. Add new player
//       const newPlayer = {
//         id: idOfUser,
//         usernameDb,
//         online: true,
//         myPerson:
//           personaData[Math.floor(Math.random() * personaData.length)].name,
//         endPick: null,
//         gameState: personaData,
//       };
//       const updateResult = await gamesCollection.updateOne(
//         { _id: foundRoom._id },
//         { $push: { players: newPlayer } }
//       );
//       if (!updateResult.modifiedCount) {
//         throw new Error("Failed to update room");
//       }

//       // 6. Send updated room back
//       const updatedRoom = await gamesCollection.findOne({ _id: foundRoom._id });
//       return res.send(updatedRoom);
//     }
//     const isUserInDb = foundRoom.players.some(
//       (player) => player.usernameDb === usernameDb
//     );

//     if (!isUserInDb)
//       return res
//         .status(400)
//         .json({ message: "Username already taken in room" });

//     return res.send(foundRoom);
//   } catch (error) {
//     console.error("Error joining room:", error);
//     res.status(500).json({ error: "Failed to join room" });
//   }
// });

const httpSrw = app.listen(PORT, () => {
  console.log(`server on port ${PORT}`);
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

const getAnyDb = async (collectionName) => {
  try {
    const items = await db.collection(collectionName).find({}).toArray();
    return items;
  } catch (err) {
    return `Error fetching Agents from DB ${err}`;
  }
};

const getSpecificRoom = async (roomId) => {
  const result = await db.collection("games").findOne(
    { id: roomId }
    // { projection: { games: { $elemMatch: { id: gameId } } } }
  );

  return result;
};

const isPlayerInRoom = async (gameId, specificUserId) => {
  const result = await db.collection("games").findOne({
    id: gameId,
    "players.id": specificUserId,
  });
  return result;
};

// const getGameStart = async (idRoom, userId) => {
//   try {
//     const personaData = await getSpecificRoom(idRoom);
//     const data = personaData[0].games;

//     console.log(data, "GET GAME START");

//     return data.players.some((player) => player.id === userId);
//   } catch (error) {
//     return false;
//   }
// };

// const fetchRoom = async (gameId) => {
//   try {
//     const response = await fetch(`${url}/games/${gameId}`);
//     const data = await response.json();
//     return data;
//   } catch (err) {
//     return err;
//   }
// };

// const removePlayerById = (gameData, playerId) => {
//   return {
//     ...gameData,
//     players: gameData.players.filter((player) => player.id !== playerId),
//   };
// };
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
    io.to(data.gameRoom).emit("disconect-user", data);
    console.log(data);
  });

  // #MONGO
  socket.on("join-room", async (room) => {
    const isPlayerInGame = await isPlayerInRoom(room.roomId, room.myId);

    if (isPlayerInGame) {
      try {
        // const gameResponse = await fetch(`${url}/games/${room.roomId}`);
        const gameData = await getSpecificRoom(room.roomId);

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

  // #MONGO
  socket.on("leave-game", async (data) => {
    try {
      const gamesCollection = await db.collection("games");
      const deleteResult = await gamesCollection.deleteOne({ id: data.idRoom });
      if (deleteResult.deletedCount === 1) {
        const gameData = {
          canLeave: true,
          msg: "Room deleted because no players left",
        };
        io.to(data.idRoom).emit("leave-game", gameData);
        socket.disconnect();
      }
    } catch (err) {
      console.log(err, "From Socket Leave");
    }
  });

  // socket.on("ready-p", (data) => {
  //   socket.broadcast.to(data.roomId).emit("ready-p", data.ready);
  // });
  // #MONGO
  socket.on("guess-agent", async (gameDataFe) => {
    try {
      const { roomId, userId, agent } = gameDataFe;

      const gamesCollection = await db.collection("games");
      const fetchedRoomData = await gamesCollection.findOne({ id: roomId });

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
      const agentToGuess = opponent.myPerson;

      const newData = {
        ...fetchedRoomData,
        players: [],
        winner: isCorrectGuess
          ? guessUserPlayer.usernameDb
          : opponent.usernameDb,
        userGuess: {
          agentToGuess,
          userIdGuess: userId,
          agent,
          userIdWon: isCorrectGuess ? guessUserPlayer.id : opponent.id,
        },
      };

      const deleteResult = await gamesCollection.deleteOne({ id: roomId });
      if (deleteResult.deletedCount === 1) {
        return io.to(roomId).emit("guess-agent", newData);
      } else {
        throw new Error("Failed to delete the room");
      }
    } catch (error) {
      console.error("Error in guess-agent handler:", error);
    }
  });

  // #MONGO
  socket.on("send-message", (msg) => {
    io.to(msg.room).emit("send-message", msg);
    console.log(msg);
  });

  // #MONGO
  socket.on("game-state", async (state) => {
    try {
      const gamesCollection = db.collection("games");

      // 1. Get the current game document
      const gameData = await gamesCollection.findOne({ id: state.room });

      if (!gameData) {
        console.error("Game not found");
        return;
      }

      // 2. Find the player index by user ID
      const playerIndex = gameData.players.findIndex(
        (player) => player.id === state.idOfUser
      );

      if (playerIndex === -1) {
        console.error("Player not found in the game");
        return;
      }

      // 3. Update the gameState for that player
      gameData.players[playerIndex].gameState = state.newGameState;

      // 4. Toggle the turn
      if (gameData.players.length === 2) {
        gameData.turn =
          gameData.players[0].id === gameData.turn
            ? gameData.players[1].id
            : gameData.players[0].id;
      }

      // 5. Update the game in MongoDB
      const updateResult = await gamesCollection.updateOne(
        { id: state.room },
        {
          $set: {
            players: gameData.players,
            turn: gameData.turn,
          },
        }
      );

      if (updateResult.modifiedCount === 0) {
        console.error("Failed to update game in MongoDB");
        return;
      }

      // 6. Emit the updated game state to all players in the room
      io.to(state.room).emit("game-state", gameData);
      console.log("Updated game state:", gameData);
    } catch (error) {
      console.error("Error updating game state:", error);
    }
  });

  // #MONGO
  // socket.on("offer", async (offer) => {
  //   const isPlayerInGame = await isPlayerInRoom(offer.room, offer.myId);

  //   console.log("OFFER", isPlayerInGame);
  //   if (isPlayerInGame) {
  //     socket.broadcast.to(offer.room).emit("offer", offer.data);
  //     console.log("OFFER sent to room:", offer);
  //   } else {
  //     console.log(`User ${offer.myId} is not part of game ${offer.room}`);
  //     socket.disconnect();
  //   }
  // });

  // // Handle answer
  // // #MONGO
  // socket.on("answer", async (answer) => {
  //   const isPlayerInGame = await isPlayerInRoom(answer.room, answer.myId);

  //   if (isPlayerInGame) {
  //     socket.broadcast.to(answer.room).emit("answer", answer.data);
  //     console.log("ANSWER sent to room:", answer);
  //   } else {
  //     console.log(`User ${answer.myId} is not part of game ${answer.room}`);
  //     socket.disconnect();
  //   }
  // });

  // // Handle ICE candidate
  // // #MONGO
  // socket.on("candidate", async (candidate) => {
  //   const isPlayerInGame = await isPlayerInRoom(candidate.room, candidate.myId);

  //   if (isPlayerInGame) {
  //     socket.broadcast.to(candidate.room).emit("candidate", candidate.data);
  //     console.log("CANDIDATE sent to room:", candidate);
  //   } else {
  //     console.log(
  //       `User ${candidate.myId} is not part of game ${candidate.room}`
  //     );
  //     socket.disconnect();
  //   }
  // });

  const activeConnections = new Map();

  // Enhanced offer handler
  socket.on("offer", async (offer) => {
    try {
      console.log(`Received offer from ${offer.myId} in room ${offer.room}`);

      const isPlayerInGame = await isPlayerInRoom(offer.room, offer.myId);

      if (isPlayerInGame) {
        // Store connection info for cleanup
        activeConnections.set(socket.id, {
          userId: offer.myId,
          roomId: offer.room,
          type: "offer",
        });

        // Broadcast offer to other players in room (excluding sender)
        socket.broadcast.to(offer.room).emit("offer", offer.data);
        console.log(`OFFER sent to room: ${offer.room}`);
      } else {
        console.log(`User ${offer.myId} is not part of game ${offer.room}`);
        socket.emit("error", {
          type: "unauthorized",
          message: "Not authorized for this room",
        });
        socket.disconnect();
      }
    } catch (error) {
      console.error("Error handling offer:", error);
      socket.emit("error", {
        type: "server_error",
        message: "Failed to process offer",
      });
    }
  });

  // Enhanced answer handler
  socket.on("answer", async (answer) => {
    try {
      console.log(`Received answer from ${answer.myId} in room ${answer.room}`);

      const isPlayerInGame = await isPlayerInRoom(answer.room, answer.myId);

      if (isPlayerInGame) {
        // Store connection info for cleanup
        activeConnections.set(socket.id, {
          userId: answer.myId,
          roomId: answer.room,
          type: "answer",
        });

        // Broadcast answer to other players in room (excluding sender)
        socket.broadcast.to(answer.room).emit("answer", answer.data);
        console.log(`ANSWER sent to room: ${answer.room}`);
      } else {
        console.log(`User ${answer.myId} is not part of game ${answer.room}`);
        socket.emit("error", {
          type: "unauthorized",
          message: "Not authorized for this room",
        });
        socket.disconnect();
      }
    } catch (error) {
      console.error("Error handling answer:", error);
      socket.emit("error", {
        type: "server_error",
        message: "Failed to process answer",
      });
    }
  });

  // Enhanced ICE candidate handler
  socket.on("candidate", async (candidate) => {
    try {
      console.log(
        `Received ICE candidate from ${candidate.myId} in room ${candidate.room}`
      );

      const isPlayerInGame = await isPlayerInRoom(
        candidate.room,
        candidate.myId
      );

      if (isPlayerInGame) {
        // Store connection info for cleanup
        if (!activeConnections.has(socket.id)) {
          activeConnections.set(socket.id, {
            userId: candidate.myId,
            roomId: candidate.room,
            type: "candidate",
          });
        }

        // Broadcast ICE candidate to other players in room (excluding sender)
        socket.broadcast.to(candidate.room).emit("candidate", candidate.data);
        console.log(`ICE CANDIDATE sent to room: ${candidate.room}`);
      } else {
        console.log(
          `User ${candidate.myId} is not part of game ${candidate.room}`
        );
        socket.emit("error", {
          type: "unauthorized",
          message: "Not authorized for this room",
        });
        socket.disconnect();
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
      socket.emit("error", {
        type: "server_error",
        message: "Failed to process ICE candidate",
      });
    }
  });

  // Handle WebRTC connection end
  socket.on("end-call", async (data) => {
    try {
      console.log(`Call ended by ${data.myId} in room ${data.room}`);

      const isPlayerInGame = await isPlayerInRoom(data.room, data.myId);

      if (isPlayerInGame) {
        // Notify other players that call has ended
        socket.broadcast.to(data.room).emit("call-ended", {
          userId: data.myId,
          message: "Peer has left the call",
        });

        // Clean up connection info
        activeConnections.delete(socket.id);

        console.log(`Call end notification sent to room: ${data.room}`);
      }
    } catch (error) {
      console.error("Error handling call end:", error);
    }
  });

  // Handle WebRTC connection failure/retry
  socket.on("connection-retry", async (data) => {
    try {
      console.log(`Connection retry from ${data.myId} in room ${data.room}`);

      const isPlayerInGame = await isPlayerInRoom(data.room, data.myId);

      if (isPlayerInGame) {
        // Notify other players about connection retry
        socket.broadcast.to(data.room).emit("peer-retry", {
          userId: data.myId,
          message: "Peer is attempting to reconnect",
        });

        console.log(`Connection retry notification sent to room: ${data.room}`);
      }
    } catch (error) {
      console.error("Error handling connection retry:", error);
    }
  });

  // Enhanced disconnect handler
  socket.on("disconnect", (reason) => {
    try {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);

      const connectionInfo = activeConnections.get(socket.id);

      if (connectionInfo) {
        const { userId, roomId } = connectionInfo;

        // Notify other players in the room about disconnection
        socket.broadcast.to(roomId).emit("peer-disconnected", {
          userId: userId,
          message: "Peer has disconnected",
          reason: reason,
        });

        // Clean up stored connection info
        activeConnections.delete(socket.id);

        console.log(
          `Peer disconnection notification sent to room: ${roomId} for user: ${userId}`
        );
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });

  // Health check for WebRTC connections
  socket.on("webrtc-health-check", async (data) => {
    try {
      const isPlayerInGame = await isPlayerInRoom(data.room, data.myId);

      if (isPlayerInGame) {
        socket.emit("webrtc-health-response", {
          status: "ok",
          timestamp: Date.now(),
          room: data.room,
        });
      } else {
        socket.emit("webrtc-health-response", {
          status: "unauthorized",
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      socket.emit("webrtc-health-response", {
        status: "error",
        timestamp: Date.now(),
        error: error.message,
      });
    }
  });

  // Room management - get active connections in room
  socket.on("get-room-connections", async (data) => {
    try {
      const isPlayerInGame = await isPlayerInRoom(data.room, data.myId);

      if (isPlayerInGame) {
        const roomConnections = [];

        // Get all sockets in the room
        const socketsInRoom = await io.in(data.room).fetchSockets();

        for (const socketInRoom of socketsInRoom) {
          const connInfo = activeConnections.get(socketInRoom.id);
          if (connInfo && connInfo.userId !== data.myId) {
            roomConnections.push({
              userId: connInfo.userId,
              socketId: socketInRoom.id,
              type: connInfo.type,
            });
          }
        }

        socket.emit("room-connections", {
          room: data.room,
          connections: roomConnections,
          total: roomConnections.length,
        });
      }
    } catch (error) {
      console.error("Error getting room connections:", error);
      socket.emit("error", {
        type: "server_error",
        message: "Failed to get room connections",
      });
    }
  });

  // Cleanup function for server shutdown
  const cleanupWebRTCConnections = () => {
    console.log("Cleaning up WebRTC connections...");

    // Notify all active connections about server shutdown
    for (const [socketId, connectionInfo] of activeConnections) {
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit("server-shutdown", {
          message: "Server is shutting down",
          timestamp: Date.now(),
        });
      }
    }

    activeConnections.clear();
  };

  // Error handling middleware for WebRTC events
  const webrtcErrorHandler = (eventName, handler) => {
    return async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`Error in ${eventName}:`, error);
        socket.emit("error", {
          type: "webrtc_error",
          event: eventName,
          message: error.message,
          timestamp: Date.now(),
        });
      }
    };
  };

  // Export cleanup function for server shutdown
  module.exports = {
    cleanupWebRTCConnections,
    webrtcErrorHandler,
  };
});

// ======================Socket logic==========
