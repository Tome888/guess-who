import { useEffect, useState } from "react";

interface GuessAgentProp {
  guessFunc: (agent: string) => void;
  roomId: string;
  playerArr: any[];
}

function GuessAgent({ guessFunc }: GuessAgentProp) {
  const [agentList, setAgentList] = useState<any[]>([]);

  const [agent, setAgent] = useState("");

  useEffect(() => {
    getAgentList();
  }, []);

  useEffect(() => {
    console.log(agent);
  }, [agent]);

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
    <div>
      <label htmlFor="agents">Select your guess:</label>
      {agentList && (
        <select
          id="agents"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
        >
          <option value="" disabled>
            -- Select an option --
          </option>
          {agentList.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={() => {
          guessFunc(agent);
        }}
      >
        Guess!
      </button>
    </div>
  );
}

export default GuessAgent;
