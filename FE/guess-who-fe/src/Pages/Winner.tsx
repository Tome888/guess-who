import { useNavigate, useParams } from "react-router-dom";
import Confetti from "../components/Confetti";
import { useEffect, useState } from "react";
import Sad from "../components/Sad";
import CustomButton from "../components/CustomButton";
import DisclaimerPC from "../components/DisclaimerPC";

function Winner() {
  const { idWin, agent, idUserGuess, agentToGuess } = useParams();
  const navigate = useNavigate();
  const [activeCon, setActiveCon] = useState(false);

  useEffect(() => {
    idWin && didIWin(idWin);
  }, [idWin]);

  const getUserLs = (idStr: string) => {
    const data = localStorage.getItem("joinGame");
    if (!data) return console.error("Game Object can't be found LS");
    const objGame = JSON.parse(data);

    const foundUser = objGame.players.filter((p: any) => p.id === idStr);

    return foundUser[0].usernameDb;
  };

  const didIWin = (username: string) => {
    const nameLs = localStorage.getItem("myName");
    if (!nameLs) return console.error("Username can't be found LS");
    const parsetName = JSON.parse(nameLs);
    const winner = getUserLs(username);

    return setActiveCon(parsetName === winner);
  };

  const backToHome = () => {
    localStorage.removeItem("joinGame");
    localStorage.removeItem("myName");

    navigate("/");
  };
  return (
    <>
      <DisclaimerPC />
      <div className="parentWinnerDiv">
        {/* <CustomButton innerTxt={"Home"} btnFuc={backToHome} /> */}

        <div className="cool-card">
          <h2>
            WINNER: <span>{idWin && getUserLs(idWin)}</span>{" "}
          </h2>
          <h3>
            {idUserGuess && getUserLs(idUserGuess)} Guessed- {agent}
          </h3>
          <h3>Correct Agent Was- {agentToGuess}</h3>
          <button className="button" role="button" onClick={() => backToHome()}>
            Home
          </button>
        </div>

        <Confetti active={activeCon} />
        <Sad active={!activeCon} />
      </div>
    </>
  );
}

export default Winner;
