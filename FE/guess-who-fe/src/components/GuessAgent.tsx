// import { useEffect, useState } from "react";

// interface GuessAgentProp {
//   guessFunc: (agent: string) => void;
//   roomId: string;
//   playerArr: any[];
// }

// function GuessAgent({ guessFunc }: GuessAgentProp) {
//   const [agentList, setAgentList] = useState<any[]>([]);

//   const [agent, setAgent] = useState("");

//   useEffect(() => {
//     getAgentList();
//   }, []);

//   useEffect(() => {
//     console.log(agent);
//   }, [agent]);

//   const getAgentList = () => {
//     const agentsLs = localStorage.getItem("agentsList");

//     if (agentsLs) {
//       const parsedList = JSON.parse(agentsLs);
//       setAgentList(parsedList);
//       return;
//     }

//     fetch(`${import.meta.env.VITE_API_URL}/agentsList`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": import.meta.env.VITE_SECRET_KEY,
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setAgentList(data);
//         const dataToSet = JSON.stringify(data);
//         localStorage.setItem("agentsList", dataToSet);
//       })
//       .catch((err) => console.log(err, "ERRRIOIIR"));
//   };

//   return (
//     <div>
//       <label htmlFor="agents">Select your guess:</label>
//       {agentList && (
//         <select
//           id="agents"
//           value={agent}
//           onChange={(e) => setAgent(e.target.value)}
//         >
//           <option value="" disabled>
//             -- Select an option --
//           </option>
//           {agentList.map((option) => (
//             <option key={option.id} value={option.name}>
//               {option.name}
//             </option>
//           ))}
//         </select>
//       )}

//       <button
//         onClick={() => {
//           guessFunc(agent);
//         }}
//       >
//         Guess!
//       </button>
//     </div>
//   );
// }

// export default GuessAgent;

import { useEffect, useState } from "react";
import SingleCard from "./SingleCard";

interface GuessAgentProp {
  guessFunc: (agent: string) => void;
  roomId: string;
  playerArr: any[];
}

function GuessAgent({ guessFunc, playerArr }: GuessAgentProp) {
  const [agentList, setAgentList] = useState<any[]>([]);
  const [agent, setAgent] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getAgentList();
  }, []);

  useEffect(() => {
    console.log(myAgentFunc(playerArr), "TestingFoundAgent");
  }, []);

  const myAgentFunc = (arrP: any[]) => {
    const myIdLs = localStorage.getItem("myId");
    const getAgentsArr = localStorage.getItem("agentsList");
    if (!myIdLs) return "Cant find Player ID";
    if (!getAgentsArr) return "Cant find Agents Array";

    const parsedId = JSON.parse(myIdLs);
    const parsedAgents = JSON.parse(getAgentsArr);

    const foundPlayer = arrP.filter((p) => p.id === parsedId);
    const theAgentName = foundPlayer[0].myPerson;

    const foundAgentFromArray = parsedAgents.filter(
      (agent: any) => agent.name === theAgentName
    );
    if (!foundPlayer) return "Player is not found";
    if (!foundAgentFromArray) return "Agent is not found";

    return foundAgentFromArray[0];
  };

  const getAgentList = () => {
    const agentsLs = localStorage.getItem("agentsList");

    if (agentsLs) {
      const parsedList = JSON.parse(agentsLs);
      setAgentList(parsedList);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/agentsList`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_SECRET_KEY,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAgentList(data);
        const dataToSet = JSON.stringify(data);
        localStorage.setItem("agentsList", dataToSet);
      })
      .catch((err) => console.log(err, "ERRRIOIIR"));
  };

  return (
    <div className="optionsWrapper">
      <div className={`person card myAgentCard`}>
        <SingleCard
          picture={myAgentFunc(playerArr).pfp}
          nameAgent={myAgentFunc(playerArr).name}
        />
      </div>
      <label>Select your guess:</label>

      {/* Selected Item */}
      <div className="selectedItem" onClick={() => setOpen(!open)}>
        {agent ? (
          <div className="agentInfo">
            <img src={agent.pfp} alt={agent.name} className="agentImg" />
            <span>{agent.name}</span>
          </div>
        ) : (
          <span className="placeholderText">-- Select an agent --</span>
        )}
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown Options */}
      {open && (
        <div className="dropdown">
          {agentList.map((option) => (
            <div
              key={option.id}
              className="dropdownOption"
              onClick={() => {
                setAgent(option);
                setOpen(false);
              }}
            >
              <img src={option.pfp} alt={option.name} className="agentImg" />
              <span>{option.name}</span>
            </div>
          ))}
        </div>
      )}

      <button
        className="guessButton button"
        onClick={() => agent && guessFunc(agent.name)}
      >
        Guess!
      </button>
    </div>
  );
}

export default GuessAgent;
// import { useEffect, useState } from "react";

// interface GuessAgentProp {
//   guessFunc: (agent: string) => void;
//   roomId: string;
//   playerArr: any[];
// }

// function GuessAgent({ guessFunc }: GuessAgentProp) {
//   const [agentList, setAgentList] = useState<any[]>([]);
//   const [agent, setAgent] = useState<any>(null);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     getAgentList();
//   }, []);

//   const getAgentList = () => {
//     const agentsLs = localStorage.getItem("agentsList");

//     if (agentsLs) {
//       const parsedList = JSON.parse(agentsLs);
//       setAgentList(parsedList);
//       return;
//     }

//     fetch(`${import.meta.env.VITE_API_URL}/agentsList`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-key": import.meta.env.VITE_SECRET_KEY,
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setAgentList(data);
//         const dataToSet = JSON.stringify(data);
//         localStorage.setItem("agentsList", dataToSet);
//       })
//       .catch((err) => console.log(err, "ERRRIOIIR"));
//   };

//   return (
//     <div style={{ position: "relative", width: "200px" }}>
//       <label>Select your guess:</label>

//       {/* Selected Item */}
//       <div
//         onClick={() => setOpen(!open)}
//         style={{
//           border: "1px solid #ccc",
//           padding: "0.5rem",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           background: "#fff",
//         }}
//       >
//         {agent ? (
//           <div style={{ display: "flex", alignItems: "center" }}>
//             <img
//               src={agent.image}
//               alt={agent.name}
//               style={{
//                 width: 24,
//                 height: 24,
//                 borderRadius: "50%",
//                 marginRight: 8,
//               }}
//             />
//             <span>{agent.name}</span>
//           </div>
//         ) : (
//           <span style={{ color: "#888" }}>-- Select an agent --</span>
//         )}
//         <span>{open ? "▲" : "▼"}</span>
//       </div>

//       {/* Dropdown Options */}
//       {open && (
//         <div
//           style={{
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//             border: "1px solid #ccc",
//             background: "#fff",
//             zIndex: 10,
//             maxHeight: 200,
//             overflowY: "auto",
//           }}
//         >
//           {agentList.map((option) => (
//             <div
//               key={option.id}
//               onClick={() => {
//                 setAgent(option);
//                 setOpen(false);
//               }}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 padding: "0.5rem",
//                 cursor: "pointer",
//                 borderBottom: "1px solid #eee",
//               }}
//             >
//               <img
//                 src={option.pfp}
//                 alt={option.name}
//                 style={{
//                   width: 24,
//                   height: 24,
//                   borderRadius: "50%",
//                   marginRight: 8,
//                 }}
//               />
//               <span>{option.name}</span>
//             </div>
//           ))}
//         </div>
//       )}

//       <button
//         onClick={() => {
//           if (agent) guessFunc(agent.name);
//         }}
//         style={{ marginTop: "1rem" }}
//       >
//         Guess!
//       </button>
//     </div>
//   );
// }

// export default GuessAgent;
