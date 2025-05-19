import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  permit: boolean;
  setFunc: (permit: boolean) => void;
}

function Home({ permit, setFunc }: HomeProps) {
  const [roomNameInput, setRoomName] = useState("");
  const [roomPassInput, setRoomPass] = useState("");
  const [username, setUsername] = useState("");

  const [roomNameInputJ, setRoomNameJ] = useState("");
  const [roomPassInputJ, setRoomPassJ] = useState("");
  const [usernameJ, setUsernameJ] = useState("");

  const navigate = useNavigate();

  console.log(permit);

  useEffect(() => {
    const dataForGame = localStorage.getItem("joinGame");
    const myId = localStorage.getItem("myId");

    if (dataForGame && myId) {
      setFunc(true);
      navigate("/game-on");
    }
  }, []);

  const createRoomFunc = (rName: string, rPass: string, user: string) => {
    const roomData = {
      roomName: rName,
      roomPassword: rPass,
      usernameDb: user,
    };
    fetch(`${import.meta.env.VITE_API_URL}/createRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_SECRET_KEY,
      },
      body: JSON.stringify(roomData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setFunc(true);
        localStorage.setItem("joinGame", JSON.stringify(data));
        localStorage.setItem("myId", JSON.stringify(data.players[0].id));
        localStorage.setItem("myName", JSON.stringify(user));

        console.log("User registered", data);

        navigate("/game-on");
      })
      .catch((error) => {
        console.error("Error registering user:", error);
        alert("denied");
      });
  };

  const joinRoom = (rName: string, rPass: string, user: string) => {
    const roomData = {
      roomName: rName,
      roomPassword: rPass,
      usernameDb: user,
    };
    fetch(`${import.meta.env.VITE_API_URL}/joinRoom`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_SECRET_KEY,
      },
      body: JSON.stringify(roomData),
    })
      .then((res) => res.json())
      .then((data) => {
        setFunc(true);
        localStorage.setItem("joinGame", JSON.stringify(data));
        localStorage.setItem("myId", JSON.stringify(data.players[1].id));
        localStorage.setItem("myName", JSON.stringify(user));

        navigate("/game-on");
        console.log(data, "JOIN DATA FROM ENDPOINT");
      })
      .catch((err) => console.error(err, "ERROR FROM JOIN"));
  };

  return (
    <main>
      <h1>Hello Home</h1>
      <form
        action="submit"
        onSubmit={(e) => {
          e.preventDefault();
          joinRoom(roomNameInputJ, roomPassInputJ, usernameJ);
          console.log("Join", import.meta.env.VITE_API_URL);

          setRoomNameJ("");
          setRoomPassJ("");
          setUsernameJ("");
        }}
      >
        <h3>Join</h3>
        <input
          type="text"
          placeholder="Name Room"
          onChange={(e) => setRoomNameJ(e.target.value.trim())}
          value={roomNameInputJ}
          required
        />
        <input
          type="text"
          placeholder="Password Room"
          onChange={(e) => setRoomPassJ(e.target.value.trim())}
          value={roomPassInputJ}
          required
        />
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsernameJ(e.target.value.trim())}
          value={usernameJ}
          required
        />
        <button type="submit">Join</button>
      </form>

      <form
        action="submit"
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Join", import.meta.env.VITE_API_URL);

          setRoomName("");
          setRoomPass("");
          setUsername("");
          createRoomFunc(roomNameInput, roomPassInput, username);
        }}
      >
        <h3>Create</h3>
        <input
          type="text"
          placeholder="Name Room"
          onChange={(e) => setRoomName(e.target.value.trim())}
          value={roomNameInput}
          required
        />
        <input
          type="text"
          placeholder="Password Room"
          onChange={(e) => setRoomPass(e.target.value.trim())}
          value={roomPassInput}
          required
        />
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value.trim())}
          value={username}
          required
        />
        <button type="submit">Create</button>
      </form>
    </main>
  );
}

export default Home;
