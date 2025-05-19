import { useEffect, useRef } from "react";
import GuessAgent from "./GuessAgent";

interface LiveChatProps {
  chatHistory: any[];
  sendMsgFunc: (message: string) => void;
  msgState: string;
  setMsgState: (message: string) => void;
}
function LiveChat({
  chatHistory,
  sendMsgFunc,
  msgState,
  setMsgState,
}: LiveChatProps) {
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log(chatHistory);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <>
      <div className="liveChatWrapper">
        <div className="chatScroll">
          <span>Live Chat...</span>
          {chatHistory.map((textString, idx) => (
            <p key={idx}>
              <b>{textString.nameOfUser}</b>: {textString.sentMsg}
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
            value={msgState}
            onChange={(e) => {
              setMsgState(e.target.value);
            }}
          />

          <button type="submit">Send</button>
        </form>
      </div>
      {/* <GuessAgent /> */}
    </>
  );
}

export default LiveChat;
