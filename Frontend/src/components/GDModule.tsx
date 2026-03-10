import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp, { Client } from 'stompjs';
import { Mic, Users, Lock, MessageSquare, Timer } from 'lucide-react';

// --- Interfaces ---
interface GDRoom {
  id: string;
  topic: string;
  isPrivate: boolean;
  accessCode?: string;
  currentParticipants: number;
}

const GDModule: React.FC = () => {
  const [rooms, setRooms] = useState<GDRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<GDRoom | null>(null);
  const [topicInput, setTopicInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const stompClient = useRef<Client | null>(null);

  // 1. Fetch Public Rooms
  const refreshRooms = async () => {
    const res = await axios.get('http://localhost:8080/api/gd/ongoing');
    setRooms(res.data);
  };

  useEffect(() => { refreshRooms(); }, []);

  // 2. Create Room (Matches our Backend @RequestParam logic)
  const handleCreateRoom = async (isPrivate: boolean) => {
    if (!topicInput) return alert("Enter a topic!");
    const res = await axios.post(`http://localhost:8080/api/gd/create`, null, {
      params: { topic: topicInput, isPrivate }
    });
    joinRoom(res.data);
  };

  // 3. Join Live Session
  const joinRoom = (room: GDRoom) => {
    setActiveRoom(room);
    const socket = new SockJS('http://localhost:8080/ws-gd');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      client.subscribe(`/topic/room/${room.id}`, (payload) => {
        const msg = JSON.parse(payload.body);
        setMessages((prev) => [...prev, msg]);
      });

      // Notify others we joined
      client.send(`/app/gd.join/${room.id}`, {}, JSON.stringify({
        sender: 'User_' + Math.floor(Math.random() * 100),
        type: 'JOIN'
      }));
    });
    stompClient.current = client;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {!activeRoom ? (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-blue-400">ClashVerse: GD Arena</h1>
          
          {/* Create Section */}
          <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
            <h2 className="text-xl mb-4">Start a New Discussion</h2>
            <input 
              className="bg-gray-700 w-full p-3 rounded mb-4 text-white"
              placeholder="Enter Discussion Topic..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => handleCreateRoom(false)} className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">Public Room</button>
              <button onClick={() => handleCreateRoom(true)} className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700 flex items-center gap-2">
                <Lock size={18}/> Private Room
              </button>
            </div>
          </div>

          {/* Lobby List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map(room => (
              <div key={room.id} className="bg-gray-800 p-4 rounded border-l-4 border-blue-500 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{room.topic}</p>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><Users size={14}/> {room.currentParticipants} Active</p>
                </div>
                <button onClick={() => joinRoom(room)} className="text-blue-400 hover:underline">Join Room</button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Room View */
        <div className="max-w-5xl mx-auto h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Topic: {activeRoom.topic}</h2>
            {activeRoom.isPrivate && <span className="bg-purple-900 text-purple-200 px-3 py-1 rounded text-sm">Code: {activeRoom.accessCode}</span>}
          </div>

          <div className="flex-1 bg-gray-800 rounded-lg p-6 overflow-y-auto mb-4 border border-gray-700">
            {messages.map((m, i) => (
              <div key={i} className="mb-3 p-2 bg-gray-700 rounded w-fit max-w-[80%]">
                <span className="text-blue-400 font-bold">{m.sender}: </span>
                <span>{m.content || "Joined the room"}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-green-600 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700">
              <Mic /> Click to Speak (60s Timer)
            </button>
            <button onClick={() => window.location.reload()} className="bg-red-600 px-6 py-4 rounded-lg font-bold">Leave</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDModule;