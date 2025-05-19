import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface NavBarProps {
  gameData: any;

  leaveFuncChat: () => void;

  setRoom: (data: any) => void;

  socket: any;
}

function NavBar({ gameData, leaveFuncChat, setRoom, socket }: NavBarProps) {
  const navigate = useNavigate();
  // const [leave, setLeave] = useState(false)

  // useEffect()

  // useEffect(() => {
  //   console.log(gameData);
  // }, [gameData]);
  const leaveFunction = () => {
    const myIdLS = localStorage.getItem("myId");
    if (!myIdLS) return console.error("Missing userID");

    const parsedId = JSON.parse(myIdLS);

    const player = gameData.players.find(
      (player: any) => player.id === parsedId
    );

    if (!player) return console.error("User not found in room");

    const leaveDataToSend = {
      roomId: gameData.id,
      userId: parsedId,
    };

    fetch(`${import.meta.env.VITE_API_URL}/leave-game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_SECRET_KEY,
      },
      body: JSON.stringify(leaveDataToSend),
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data, "leave response");
        if (data.canLeave) {
          localStorage.removeItem("joinGame");
          localStorage.removeItem("myId");
          localStorage.removeItem("myName");
          socket.current.disconnect();
          setRoom(data.newData);
          leaveFuncChat();
          return navigate("/");
        }
      })
      .catch((err) => console.error(`Something went wront ${err}`));
  };

  return (
    <nav>
      <h2>Room: {gameData.roomName}</h2>
      <button onClick={leaveFunction}>Leave Game</button>
    </nav>
  );
}

export default NavBar;
