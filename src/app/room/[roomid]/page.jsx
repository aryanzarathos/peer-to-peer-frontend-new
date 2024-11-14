'use client'
import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Peer from 'simple-peer';
import { useParams } from "next/navigation";
export default function Room() {
  const params = useParams()
  const [peer, setPeer] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [file, setFile] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [dataChannelOpen, setDataChannelOpen] = useState(false);

  console.log(params, "line 11")
  const initiateConnection = () => {
    const newPeer = new Peer({ initiator: true, trickle: false });

    newPeer.on('signal', (data) => socket.send(JSON.stringify({ type: 'signal', data })));
    newPeer.on('connect', () => setIsConnected(true));

    newPeer.on('data', (chunk) => setChunks((prev) => [...prev, chunk]));

    // Listen for the 'open' event to know when data channel is ready
    newPeer.on('open', () => {
      setDataChannelOpen(true); // Set data channel as open
      console.log("Data channel is open and ready for transfers");
    });

    setPeer(newPeer);
  };

  const handleSignal = (signalData) => {
    peer.signal(signalData);
  };

  const sendFile = () => {
    if (!dataChannelOpen) {
      console.log("Data channel is not open yet. Please wait...");
      return;
    }

    const chunkSize = 64 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      peer.send(chunk);
    }
    setFile(null);
  };
  const handleFileSelect = (e) => setFile(e.target.files[0]);

  const saveReceivedFile = () => {
    const blob = new Blob(chunks);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "received_file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setChunks([]);
  };

  useEffect(() => {
    // Initialize WebSocket connection
    // console.log(`ws://localhost:8080/${params.roomid}`, "line 41")
    const ws = new WebSocket(`ws://localhost:8080/${params.roomid}`)
    // const ws = new WebSocket(`wss://peer-to-peer-backend-8tcu.onrender.com/${params.roomid}`); // Replace with your WebSocket server URL

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
      // setMessage('');
      // if (message.type === 'signal') {
      //   peer.signal(message.data); // Ensure the peer is handling incoming signals
      // } else if (message.type === 'welcome') {
      //   setSocket(ws);
      //   console.log('Welcome message:', message);
      // }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Save WebSocket instance to state to send messages later
    setSocket(ws);

    // Cleanup when component unmounts
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && input) {
      socket.send(input);
      setInput('');
  }
  };
  return (
    <div className={styles.page}>
      <h2>Peer-to-Peer Room</h2>
      {/* <button onClick={initiateConnection}>Connect to Peer</button>
      {isConnected && <p>Connected to peer!</p>}
      <input type="file" onChange={handleFileSelect} />
      <button onClick={sendFile} disabled={!file}>Send File</button>
      {chunks.length > 0 && <button onClick={saveReceivedFile}>Save Received File</button>} */}

      <div>
        <h3>Messages:</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
