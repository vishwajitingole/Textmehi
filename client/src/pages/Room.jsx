import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import "./Room.css";

function Room() {
  const { roomid } = useParams();
  const m = useRef(null);
  const chatWindowRef = useRef(null); // Reference for the chat window
  const [messages, setMessages] = useState([]);
  const socket = useSelector((e) => e.socket.socket);

  // Create an Audio object for the notification sound
  const notificationSound = useRef(new Audio("/iphone.mp3"));
  const sentSound = useRef(new Audio("/iphoneSent.mp3"));

  useEffect(() => {
    socket.on("sentall", handleReceiveMessage);

    return () => {
      socket.off("sentall", handleReceiveMessage);
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Add event listener for Enter key press
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleSend();
      }
    };

    const inputElement = m.current;
    inputElement.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      inputElement.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleTime() {
    var now = new Date();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var ap = "AM";
    if (hour > 11) {
      ap = "PM";
    }
    if (hour > 12) {
      hour = hour - 12;
    }
    if (hour == 0) {
      hour = 12;
    }
    if (hour < 10) {
      hour = "0" + hour;
    }
    if (minute < 10) {
      minute = "0" + minute;
    }
    if (second < 10) {
      second = "0" + second;
    }
    var timeString = hour + ":" + minute + " " + ap;

    return timeString;
  }

  function handleSend() {
    const message = m.current.value;
    const email = localStorage.getItem("email");

    var timeString = handleTime();

    socket.emit("all", { message, email });
    setMessages((prevMessages) => [
      ...prevMessages,
      { message, sentByMe: true, email, timeString },
    ]);
    m.current.value = "";
    const playPromise = sentSound.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay started
          playNotificationSound();
        })
        .catch((error) => {
          // Autoplay was prevented
          console.log("Autoplay was prevented:", error);
        });
    }
  }

  function handleReceiveMessage(data) {
    const { message, email } = data;
    console.log({ message, email });
    var timeString = handleTime();
    setMessages((prevMessages) => [
      ...prevMessages,
      { message, email, sentByMe: false, timeString },
    ]);

    // Check if the browser allows autoplay
    const playPromise = notificationSound.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay started
          playNotificationSound();
        })
        .catch((error) => {
          // Autoplay was prevented
          console.log("Autoplay was prevented:", error);
        });
    }
  }

  function playNotificationSound() {
    // Play the notification sound
  }

  return (
    <div className="relative w-screen h-screen text-white bg-gray-900">
      <div className="pt-10 text-center">
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-5xl font-bold"
        >
          Chat Room
        </motion.h1>
        <div className="">
          <motion.button
            onClick={handleSend}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.96 }}
            className="absolute bottom-4 left-[82vw] p-2 rounded-lg sm:left-[95vw] bg-slate-400"
          >
            Send
          </motion.button>
        </div>
        <div className="">
          <input
            ref={m}
            type="text"
            className="absolute font-bold tracking-widest bottom-4 text-black px-3 rounded-xl w-[80vw] sm:w-[94vw] left-0 h-[6vh]"
          />
        </div>

        <div
          ref={chatWindowRef} // Reference for the chat window
          className="mt-16 overflow-scroll text-red-500 chat-window"
          style={{ maxHeight: "66vh" }}
        >
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`px-3 ml-5 overflow-auto text-2xl ${
                message.sentByMe ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`text-sm  text-white ${
                  message.sentByMe ? "text-white" : " text-yellow-300"
                }  text-pretty tighter`}
              >
                {message.email}
              </div>
              <div className="font-serif text-4xl sm:text-3xl">
                {message.message}
              </div>
              <div className="sm:text-[1vw] text-opacity-80 text-semibold text-xs font-thin text-white ">
                {message.timeString}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Room;
