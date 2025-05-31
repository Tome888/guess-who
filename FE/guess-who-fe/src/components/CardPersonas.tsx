import { useEffect, useState } from "react";
import SinglePerson from "./SinglePerson";
import SingleCard from "./SingleCard";
import Spiner from "./Spiner";

interface PersonasProps {
  arrPersonas: any[];
  changePersonas: ([]: any) => void;
  pickFunction: (arr: any[]) => void;
  // pickFunction: () => void;

  fullData: any;
}

function CardPersonas({
  arrPersonas,
  pickFunction,
  changePersonas,
  fullData,
}: PersonasProps) {
  const [localPersonas, setLocalPersonas] = useState<any[]>([]);
  // const filterPersons = (perId: string) => {
  //   const filtered = arrPersonas.filter((person) => person.id !== perId);

  //   changePersonas(filtered);
  // };

  useEffect(() => {
    console.log(turnActivate());

    setLocalPersonas(arrPersonas);
  }, [arrPersonas]);

  const turnActivate = () => {
    const dataUserLs = localStorage.getItem("myId");
    if (!dataUserLs) return console.log("missing user id");
    const userIdLs = JSON.parse(dataUserLs);

    // console.log(userIdLs);
    if (
      fullData &&
      dataUserLs &&
      userIdLs === fullData.turn &&
      fullData.players.length === 2
    ) {
      return true;
    } else {
      return false;
    }
  };

  const changeLocal = (id: string) => {
    if (localPersonas.some((person) => person.id === id)) {
      const filtered = localPersonas.filter((person) => person.id !== id);
      setLocalPersonas(filtered);
      console.log(localPersonas, "LOCAL PERS");
    } else {
      const foundPerson = arrPersonas.find((person) => person.id === id);
      if (!foundPerson) return;
      const updated = [...localPersonas, foundPerson];
      const idOrderMap = new Map(
        arrPersonas.map((item, index) => [item.id, index])
      );

      const sorted = updated.sort(
        (a, b) =>
          (idOrderMap.get(a.id) ?? Infinity) -
          (idOrderMap.get(b.id) ?? Infinity)
      );
      setLocalPersonas(sorted);
      console.log(localPersonas, "LOCAL PERS");
    }
  };

  const styleFunc = (localArr: any[], id: string) => {
    const isFound = localArr.some((person) => person.id === id);

    return isFound;
  };

  const doneFunction = () => {
    changePersonas(localPersonas);
    pickFunction(localPersonas);
  };
  return (
    // <>
    //   {turnActivate() && (
    //     <button
    //       onClick={() =>
    //         turnActivate() ? pickFunction() : alert("Not Your turn Nigga")
    //       }
    //     >
    //       Done
    //     </button>
    //   )}
    //   <div className="personasWrapper">
    //     {arrPersonas &&
    //       arrPersonas.map((person) => {
    //         return (
    //           <div
    //             key={person.id}
    //             className="person"
    //             onClick={() => {
    //               turnActivate()
    //                 ? filterPersons(person.id)
    //                 : alert("Not Your turn Nigga");
    //             }}
    //           >
    //             <img src={person.pfp} />
    //             <h3>{person.name}</h3>
    //           </div>
    //         );
    //       })}
    //   </div>
    // </>

    <div className="wrapperLeft">
      <div className="personasWrapper">
        {arrPersonas &&
          arrPersonas.map((person) => {
            return (
              <div
                className={`person card ${
                  styleFunc(localPersonas, person.id) ? "" : "test"
                }`}
                onClick={() => {
                  turnActivate()
                    ? changeLocal(person.id)
                    : alert("Not Your Turn");
                }}
                key={person.id}
              >
                <SingleCard picture={person.pfp} nameAgent={person.name} />
              </div>
            );
          })}
        {!arrPersonas && <Spiner />}
      </div>
      <>
        {turnActivate() && (
          <button
            title="Finish your turn"
            className=" doneBtn"
            onClick={() =>
              turnActivate() ? doneFunction() : alert("Not Your turn Nigga")
            }
          >
            Done
          </button>
        )}
      </>
    </div>

    // <>
    //   {turnActivate() && (
    //     <button
    //       onClick={() =>
    //         turnActivate() ? doneFunction() : alert("Not Your turn Nigga")
    //       }
    //     >
    //       Done
    //     </button>
    //   )}
    //   <div className="personasWrapper">
    //     {localPersonas &&
    //       arrPersonas.map((person) => {
    //         return (
    //           // <div
    //           //   key={person.id}
    //           //   className={`person ${setClassAgent(person.id) ? "test" : ""}`}
    //           //   onClick={() => {
    //           //     turnActivate()
    //           //       ? agentToggle(person.id)
    //           //       : alert("Not Your turn Nigga");
    //           //   }}
    //           // >
    //           //   <img src={person.pfp} />
    //           //   <h3>{person.name}</h3>
    //           // </div>
    //           <SinglePerson
    //             key={person.id}
    //             isTurn={turnActivate}
    //             agentId={person.id}
    //             pfp={person.pfp}
    //             nameName={person.name}
    //             mainArr={arrPersonas}
    //             virtualArr={localPersonas}
    //             setVirtArr={setLocalPersonas}
    //           />
    //         );
    //       })}
    //   </div>
    // </>
  );
}

export default CardPersonas;
