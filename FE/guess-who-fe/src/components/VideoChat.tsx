// import { useEffect, useRef, useState } from "react";
// import NavBar from "./NavBar";

// interface VideoChatProps {
//   roomId: string | null;
//   refSocket: any;
//   numPlayers: number | null;
//   allGameData: any;
//   setGameStateFunc: (data: any) => void;
// }

// function VideoChat({
//   roomId,
//   refSocket,
//   numPlayers,
//   allGameData,
//   setGameStateFunc,
// }: VideoChatProps) {
//   const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//   const [isVideoEnabled, setIsVideoEnabled] = useState(true);

//   const localVideoRef = useRef<HTMLVideoElement | null>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
//   const [peerConnection, setPeerConnection] =
//     useState<RTCPeerConnection | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [myIdLs, setMyIdLs] = useState<string | null>(null);

//   const [disableBtn, setDisableBtn] = useState(true);
//   const [toggler, setToggler] = useState(true);

//   // Queue for ICE candidates received before remote description is set
//   const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);

//   useEffect(() => {
//     setTimeout(() => {
//       setDisableBtn(!disableBtn);
//     }, 10000);
//   }, [toggler]);
//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     if (!localStream) {
//       setDisableBtn(true);
//       timer = setTimeout(() => {
//         setDisableBtn(false);
//       }, 10000);
//     }

//     return () => clearTimeout(timer);
//   }, [toggler, localStream]);
//   const leaveCall = () => {
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//     }
//     if (peerConnection) {
//       peerConnection.close();
//       setPeerConnection(null);
//     }
//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = null;
//     }
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = null;
//     }
//     setLocalStream(null);
//     // Clear the ICE candidate queue
//     iceCandidateQueue.current = [];
//   };

//   const setupPeerConnection = async (
//     pc: RTCPeerConnection,
//     stream: MediaStream
//   ) => {
//     stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         refSocket.current.emit("candidate", {
//           room: roomId,
//           data: event.candidate,
//           myId: myIdLs,
//         });
//       }
//     };

//     pc.ontrack = (event) => {
//       if (remoteVideoRef.current) {
//         remoteVideoRef.current.srcObject = event.streams[0];
//       }
//       event.streams[0].getTracks().forEach((track) => {
//         track.onended = () => leaveCall();
//       });
//     };

//     pc.onconnectionstatechange = () => {
//       if (
//         pc.connectionState === "disconnected" ||
//         pc.connectionState === "failed"
//       ) {
//         leaveCall();
//       }
//     };

//     return pc;
//   };

//   const startCall = async () => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: isVideoEnabled,
//       audio: isAudioEnabled,
//     });
//     setLocalStream(stream);
//     if (localVideoRef.current) localVideoRef.current.srcObject = stream;

//     const pc = await setupPeerConnection(new RTCPeerConnection(), stream);
//     setPeerConnection(pc);

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     refSocket.current.emit("offer", {
//       room: roomId,
//       data: offer,
//       myId: myIdLs,
//     });
//   };

//   const handleOffer = async (offer: RTCSessionDescriptionInit) => {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: isVideoEnabled,
//       audio: isAudioEnabled,
//     });
//     setLocalStream(stream);
//     if (localVideoRef.current) localVideoRef.current.srcObject = stream;

//     const pc = await setupPeerConnection(new RTCPeerConnection(), stream);
//     setPeerConnection(pc);

//     await pc.setRemoteDescription(offer);

//     // Process any queued ICE candidates after setting remote description
//     while (iceCandidateQueue.current.length > 0) {
//       const candidate = iceCandidateQueue.current.shift();
//       if (candidate) {
//         try {
//           await pc.addIceCandidate(candidate);
//         } catch (error) {
//           console.error("Error adding queued ICE candidate:", error);
//         }
//       }
//     }

//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     refSocket.current.emit("answer", {
//       room: roomId,
//       data: answer,
//       myId: myIdLs,
//     });
//   };

//   const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
//     if (peerConnection) {
//       await peerConnection.setRemoteDescription(
//         new RTCSessionDescription(answer)
//       );

//       // Process any queued ICE candidates after setting remote description
//       while (iceCandidateQueue.current.length > 0) {
//         const candidate = iceCandidateQueue.current.shift();
//         if (candidate) {
//           try {
//             await peerConnection.addIceCandidate(candidate);
//           } catch (error) {
//             console.error("Error adding queued ICE candidate:", error);
//           }
//         }
//       }
//     }
//   };

//   const handleCandidate = async (candidate: RTCIceCandidate) => {
//     if (peerConnection) {
//       // Check if remote description is set
//       if (peerConnection.remoteDescription) {
//         try {
//           await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (error) {
//           console.error("Error adding ICE candidate:", error);
//         }
//       } else {
//         // Queue the candidate until remote description is set
//         iceCandidateQueue.current.push(new RTCIceCandidate(candidate));
//       }
//     }
//   };

//   const toggleAudio = () => {
//     if (localStream) {
//       localStream.getAudioTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//       });
//       setIsAudioEnabled((prev) => !prev);
//     }
//   };

//   const toggleVideo = () => {
//     if (localStream) {
//       localStream.getVideoTracks().forEach((track) => {
//         track.enabled = !track.enabled;
//       });
//       setIsVideoEnabled((prev) => !prev);
//     }
//   };

//   useEffect(() => {
//     const dataId = localStorage.getItem("myId");
//     if (dataId) setMyIdLs(JSON.parse(dataId));

//     if (myIdLs) {
//       refSocket.current.on("offer", handleOffer);
//       refSocket.current.on("answer", handleAnswer);
//       refSocket.current.on("candidate", handleCandidate);
//     }

//     return () => {
//       refSocket.current.off("offer", handleOffer);
//       refSocket.current.off("answer", handleAnswer);
//       refSocket.current.off("candidate", handleCandidate);
//     };
//   }, [peerConnection, myIdLs]);

//   const setUsername = (fullData: any) => {
//     if (!fullData) return "";
//     const usernameLsId = localStorage.getItem("myId");
//     if (!usernameLsId) return "";
//     const userNameIdParsed = JSON.parse(usernameLsId);

//     const foundUser = fullData.players.filter(
//       (userObj: any) => userObj.id !== userNameIdParsed
//     );
//     if (foundUser.length === 0 || !foundUser[0].usernameDb) return "";
//     return foundUser[0].usernameDb;
//   };

//   return (
//     <>
//       <NavBar
//         gameData={allGameData}
//         leaveFuncChat={leaveCall}
//         setRoom={setGameStateFunc}
//         socket={refSocket}
//       />

//       <div className="videoHolder">
//         <div>
//           <p>You</p>
//           <video ref={localVideoRef} autoPlay muted width="300" />
//         </div>
//         <div>
//           <p>{setUsername(allGameData)}</p>
//           <video ref={remoteVideoRef} autoPlay width="300" />
//         </div>
//       </div>

//       <div className="videoCallBtnsWrapper">
//         {localStream && (
//           <>
//             <button title="Toggle Mute" onClick={toggleAudio}>
//               {isAudioEnabled ? "🔇" : "🔊"}
//             </button>
//             <button title="Toggle Camera" onClick={toggleVideo}>
//               {isVideoEnabled ? "📵" : "📹"}
//             </button>
//           </>
//         )}

//         {!localStream ? (
//           numPlayers === 2 ? (
//             <button
//               disabled={disableBtn}
//               style={{
//                 backgroundColor: "rgba(0, 128, 0, 0.486)",
//                 border: "2px solid rgba(0, 78, 0, 0.84)",
//               }}
//               title="Start Call"
//               onClick={() => {
//                 startCall();
//                 setToggler(!toggler);
//               }}
//             >
//               📞
//             </button>
//           ) : (
//             <h2>Waiting for player to join...</h2>
//           )
//         ) : (
//           <button
//             title="Leave Call"
//             onClick={() => {
//               leaveCall();
//               setToggler(!toggler);
//             }}
//             style={{
//               fontSize: "1.5rem",
//               fontWeight: "bold",
//               color: "black",
//               backgroundColor: "rgba(128, 0, 0, 0.49)",
//               border: "2px solid rgba(78, 0, 0, 0.84)",
//             }}
//           >
//             ❌
//           </button>
//         )}
//       </div>
//     </>
//   );
// }

// export default VideoChat;

// =================THIS IS BASE COMPONENT DO NOT DELETE========================
import { useEffect, useRef, useState } from "react";
import NavBar from "./NavBar";

interface VideoChatProps {
  roomId: string | null;
  refSocket: any;
  numPlayers: number | null;
  allGameData: any;
  setGameStateFunc: (data: any) => void;
}

// Enhanced WebRTC configuration
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun.stunprotocol.org:3478" },
];

const PC_CONFIG = {
  iceServers: ICE_SERVERS,
  iceCandidatePoolSize: 10,
  bundlePolicy: "max-bundle" as RTCBundlePolicy,
  rtcpMuxPolicy: "require" as RTCRtcpMuxPolicy,
};

function VideoChat({
  roomId,
  refSocket,
  numPlayers,
  allGameData,
  setGameStateFunc,
}: VideoChatProps) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("disconnected");

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [myIdLs, setMyIdLs] = useState<string | null>(null);

  const [disableBtn, setDisableBtn] = useState(true);
  const [toggler, setToggler] = useState(true);

  // Queue for ICE candidates received before remote description is set
  const iceCandidateQueue = useRef<RTCIceCandidate[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setDisableBtn(!disableBtn);
    }, 10000);
  }, [toggler]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!localStream) {
      setDisableBtn(true);
      timer = setTimeout(() => {
        setDisableBtn(false);
      }, 10000);
    }

    return () => clearTimeout(timer);
  }, [toggler, localStream]);

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
    setConnectionStatus("disconnected");
    // Clear the ICE candidate queue
    iceCandidateQueue.current = [];
  };

  // Enhanced media stream acquisition
  const getMediaStream = async () => {
    try {
      const constraints = {
        video: isVideoEnabled
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 60 },
            }
          : false,
        audio: isAudioEnabled
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);

      // Fallback to basic constraints
      try {
        const basicConstraints = {
          video: isVideoEnabled,
          audio: isAudioEnabled,
        };
        return await navigator.mediaDevices.getUserMedia(basicConstraints);
      } catch (fallbackError) {
        console.error("Fallback media access failed:", fallbackError);
        throw fallbackError;
      }
    }
  };

  const setupPeerConnection = async (
    pc: RTCPeerConnection,
    stream: MediaStream
  ) => {
    // Add tracks to peer connection
    stream.getTracks().forEach((track) => {
      console.log("Adding track:", track.kind);
      pc.addTrack(track, stream);
    });

    // Enhanced connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      setConnectionStatus(pc.connectionState);

      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        leaveCall();
      }
    };

    // ICE connection state monitoring
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);

      if (pc.iceConnectionState === "failed") {
        // Attempt ICE restart
        if (pc.localDescription) {
          pc.createOffer({ iceRestart: true })
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              refSocket.current.emit("offer", {
                room: roomId,
                data: pc.localDescription,
                myId: myIdLs,
              });
            })
            .catch((error) => console.error("ICE restart failed:", error));
        }
      }
    };

    // Enhanced ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE candidate:", event.candidate.type);
        refSocket.current.emit("candidate", {
          room: roomId,
          data: event.candidate,
          myId: myIdLs,
        });
      } else {
        console.log("ICE gathering complete");
      }
    };

    // Enhanced track handling
    pc.ontrack = (event) => {
      console.log("Remote track received:", event.track.kind);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }

      event.streams[0].getTracks().forEach((track) => {
        track.onended = () => {
          console.log("Remote track ended:", track.kind);
          leaveCall();
        };
      });
    };

    return pc;
  };

  const startCall = async () => {
    try {
      const stream = await getMediaStream();
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(PC_CONFIG);
      await setupPeerConnection(pc, stream);
      setPeerConnection(pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      refSocket.current.emit("offer", {
        room: roomId,
        data: offer,
        myId: myIdLs,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      alert(
        "Failed to start call. Please check your camera and microphone permissions."
      );
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      const stream = await getMediaStream();
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(PC_CONFIG);
      await setupPeerConnection(pc, stream);
      setPeerConnection(pc);

      await pc.setRemoteDescription(offer);

      // Process any queued ICE candidates after setting remote description
      while (iceCandidateQueue.current.length > 0) {
        const candidate = iceCandidateQueue.current.shift();
        if (candidate) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (error) {
            console.error("Error adding queued ICE candidate:", error);
          }
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      refSocket.current.emit("answer", {
        room: roomId,
        data: answer,
        myId: myIdLs,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        // Process any queued ICE candidates after setting remote description
        while (iceCandidateQueue.current.length > 0) {
          const candidate = iceCandidateQueue.current.shift();
          if (candidate) {
            try {
              await peerConnection.addIceCandidate(candidate);
            } catch (error) {
              console.error("Error adding queued ICE candidate:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  };

  const handleCandidate = async (candidate: RTCIceCandidate) => {
    if (peerConnection) {
      // Check if remote description is set
      if (peerConnection.remoteDescription) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      } else {
        // Queue the candidate until remote description is set
        iceCandidateQueue.current.push(new RTCIceCandidate(candidate));
      }
    }
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
            <button title="Toggle Mute" onClick={toggleAudio}>
              {isAudioEnabled ? "🔇" : "🔊"}
            </button>
            <button title="Toggle Camera" onClick={toggleVideo}>
              {isVideoEnabled ? "📵" : "📹"}
            </button>
          </>
        )}

        {!localStream ? (
          numPlayers === 2 ? (
            <>
              <button
                disabled={disableBtn}
                style={{
                  backgroundColor: "rgba(0, 128, 0, 0.486)",
                  border: "2px solid rgba(0, 78, 0, 0.84)",
                }}
                title="Start Call"
                onClick={() => {
                  startCall();
                  setToggler(!toggler);
                }}
              >
                📞
              </button>
            </>
          ) : (
            <h2>Waiting for player to join...</h2>
          )
        ) : (
          <button
            title="Leave Call"
            onClick={() => {
              leaveCall();
              setToggler(!toggler);
            }}
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "black",
              backgroundColor: "rgba(128, 0, 0, 0.49)",
              border: "2px solid rgba(78, 0, 0, 0.84)",
            }}
          >
            ❌
          </button>
        )}
      </div>
    </>
  );
}

export default VideoChat;
