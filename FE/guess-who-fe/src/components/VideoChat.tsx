// ===============V======================

// ===============main V==============

import { useEffect, useRef, useState } from "react";
import NavBar from "./NavBar";

interface VideoChatProps {
  roomId: string | null;
  refSocket: any;
  numPlayers: number | null;

  allGameData: any;

  setGameStateFunc: (data: any) => void;
}

function VideoChat({
  roomId,
  refSocket,
  numPlayers,
  allGameData,
  setGameStateFunc,
}: VideoChatProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [myIdLs, setMyIdLs] = useState<string | null>(null);

  const leaveCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setLocalStream(null);
  };

  const setupPeerConnection = async (
    pc: RTCPeerConnection,
    stream: MediaStream
  ) => {
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        refSocket.current.emit("candidate", {
          room: roomId,
          data: event.candidate,
          myId: myIdLs,
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      event.streams[0].getTracks().forEach((track) => {
        track.onended = () => leaveCall();
      });
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        leaveCall();
      }
    };

    return pc;
  };

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideoEnabled,
      audio: isAudioEnabled,
    });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = await setupPeerConnection(new RTCPeerConnection(), stream);
    setPeerConnection(pc);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    refSocket.current.emit("offer", {
      room: roomId,
      data: offer,
      myId: myIdLs,
    });
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideoEnabled,
      audio: isAudioEnabled,
    });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = await setupPeerConnection(new RTCPeerConnection(), stream);
    setPeerConnection(pc);

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    refSocket.current.emit("answer", {
      room: roomId,
      data: answer,
      myId: myIdLs,
    });
  };

  const handleAnswer = (answer: RTCSessionDescriptionInit) => {
    if (peerConnection)
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = (candidate: RTCIceCandidate) => {
    if (peerConnection)
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled((prev) => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled((prev) => !prev);
    }
  };

  useEffect(() => {
    const dataId = localStorage.getItem("myId");
    if (dataId) setMyIdLs(JSON.parse(dataId));

    if (myIdLs) {
      refSocket.current.on("offer", handleOffer);
      refSocket.current.on("answer", handleAnswer);
      refSocket.current.on("candidate", handleCandidate);
    }

    return () => {
      refSocket.current.off("offer", handleOffer);
      refSocket.current.off("answer", handleAnswer);
      refSocket.current.off("candidate", handleCandidate);
    };
  }, [peerConnection, myIdLs]);
  const setUsername = (fullData: any) => {
    if (!fullData) return "";
    const usernameLsId = localStorage.getItem("myId");
    if (!usernameLsId) return "";
    const userNameIdParsed = JSON.parse(usernameLsId);

    const foundUser = fullData.players.filter(
      (userObj: any) => userObj.id !== userNameIdParsed
    );
    // if (!foundUser[0].usernameDb) return "";
    if (foundUser.length === 0 || !foundUser[0].usernameDb) return "";
    return foundUser[0].usernameDb;
  };

  return (
    <>
      <NavBar
        gameData={allGameData}
        leaveFuncChat={leaveCall}
        setRoom={setGameStateFunc}
        socket={refSocket}
      />

      <div className="videoHolder">
        <div>
          <p>You</p>
          <video ref={localVideoRef} autoPlay muted width="300" />
        </div>
        <div>
          <p>{setUsername(allGameData)}</p>
          <video ref={remoteVideoRef} autoPlay width="300" />
        </div>
      </div>

      <div className="videoCallBtnsWrapper">
        {localStream && (
          <>
            <button onClick={toggleAudio}>
              {isAudioEnabled ? "Mute" : "Unmute"}
            </button>
            <button onClick={toggleVideo}>
              {isVideoEnabled ? "Video Off" : "Video On"}
            </button>
          </>
        )}

        {!localStream ? (
          numPlayers === 2 ? (
            <button onClick={startCall}>Start Call</button>
          ) : (
            <h2>Waiting for player to join...</h2>
          )
        ) : (
          <button onClick={leaveCall} style={{ color: "red" }}>
            Leave Call
          </button>
        )}
      </div>
    </>
  );
}

export default VideoChat;
