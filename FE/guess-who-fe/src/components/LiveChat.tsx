import { useEffect, useRef, useState } from "react";
import GuessAgent from "./GuessAgent";

interface LiveChatProps {
  chatHistory: any[];
  sendMsgFunc: (message: string) => void;
  msgState: string;
  setMsgState: (message: string) => void;
  fullData: any;
}
function LiveChat({
  chatHistory,
  sendMsgFunc,
  msgState,
  setMsgState,
  fullData,
}: LiveChatProps) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [myName, setMyName] = useState("You");

  useEffect(() => {
    console.log(chatHistory);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    const dataName = localStorage.getItem("myName");

    if (!dataName) return;
    if (!fullData) return;
    const parsedName = JSON.parse(dataName);

    const foundArrUser = fullData.players.filter(
      (p: any) => p.usernameDb === parsedName
    );

    if (!foundArrUser[0]) return;

    setMyName(foundArrUser[0].usernameDb);
  }, [fullData]);
  return (
    <>
      <div className="liveChatWrapper">
        <div className="chatScroll">
          <span>Live Chat...</span>
          {chatHistory.map((textString, idx) => (
            <p key={idx}>
              <b>
                {myName === textString.nameOfUser
                  ? "You"
                  : textString.nameOfUser}
                :
              </b>{" "}
              <span
                style={{
                  backgroundColor: `${
                    myName === textString.nameOfUser ? "gray" : "#454ade"
                  }`,
                }}
              >
                {textString.sentMsg}
              </span>
            </p>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form
          className="chatFrom"
          action="submit"
          onSubmit={(e) => {
            e.preventDefault();
            sendMsgFunc(msgState);
            setMsgState(""); // Clear message input after sending
          }}
        >
          <input
            type="text"
            className="chatinput"
            value={msgState}
            onChange={(e) => {
              setMsgState(e.target.value);
            }}
          />

          <button type="submit" className="chatBtn button">
            Send
          </button>
        </form>
      </div>
      {/* <GuessAgent /> */}
    </>
  );
}

export default LiveChat;
