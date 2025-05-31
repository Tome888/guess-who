import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";
import Spiner from "../components/Spiner";
import DisclaimerPC from "../components/DisclaimerPC";

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

  const [side, setSide] = useState<"create" | "join">("create");

  const [spin, setSpin] = useState(false);

  const navigate = useNavigate();

  const toggleSide = () => {
    setSide((prev) => (prev === "create" ? "join" : "create"));
  };
  // console.log(permit);

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
        setSpin(false);
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
      })
      .finally(() => setSpin(false));
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
        setSpin(false);
        setFunc(true);
        localStorage.setItem("joinGame", JSON.stringify(data));
        localStorage.setItem("myId", JSON.stringify(data.players[1].id));
        localStorage.setItem("myName", JSON.stringify(user));

        navigate("/game-on");
        console.log(data, "JOIN DATA FROM ENDPOINT");
      })
      .catch((err) => {
        alert("Room doesn't exist");
        console.error(err, "CAN'T JOIN ROOM");
      })
      .finally(() => setSpin(false));
  };

  return (
    <>
      <DisclaimerPC />

      <main>
        <h1>Guess The Valorant Agent</h1>
        <div className="switchWrapper">
          <h2 className={side === "create" ? "activeToggle" : ""}>Create</h2>
          <div className="cl-toggle-switch">
            <label className="cl-switch">
              <input type="checkbox" onClick={toggleSide} />
              <span></span>
            </label>
          </div>
          <h2 className={side === "create" ? "" : "activeToggle"}>Join</h2>
        </div>
        <div className="flip-card-container">
          <div className="flip-card">
            <div
              className={`flip-card-inner ${side === "join" ? "flipped" : ""}`}
            >
              <div className="flip-card-front">
                <form
                  action="submit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Join", import.meta.env.VITE_API_URL);

                    setSpin(true);
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
                  {spin ? (
                    <Spiner />
                  ) : (
                    <button type="submit" className="button" role="button">
                      Create
                    </button>
                  )}
                </form>
              </div>
              <div className="flip-card-back">
                <form
                  action="submit"
                  onSubmit={(e) => {
                    e.preventDefault();
                    joinRoom(roomNameInputJ, roomPassInputJ, usernameJ);
                    console.log("Join", import.meta.env.VITE_API_URL);
                    setSpin(true);
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

                  {spin ? (
                    <Spiner />
                  ) : (
                    <button type="submit" className="button" role="button">
                      Join
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="disclaimerDiv">
          <p>
            <strong>Disclaimer:</strong>
            <br />
            If you're on a network with strict firewall rules (e.g., corporate,
            school, or mobile networks), the video chat may not work properly
            due to blocked WebRTC connections.
          </p>
        </div>
      </main>
    </>
  );
}

export default Home;
