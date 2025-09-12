import { useEffect, useState } from 'react';
import io from 'socket.io-client';

interface Message {
  text: string;
  clientId: string; //username
}

// const socket = io('http://localhost:3005');

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);

  //   useEffect(() => {
  //     socket.on('connect', () => {
  //       setClientId(socket.id || '');
  //     });

  //     socket.on('user-joined', (data: { message: string; clientId: string }) => {
  //       const joinMessage = { text: data.message, clientId: data.clientId };
  //       setMessages((prevMessages) => [...prevMessages, joinMessage]);
  //     });

  //     socket.on('user-left', (data: { message: string; clientId: string }) => {
  //       const leaveMessage = { text: data.message, clientId: data.clientId };
  //       setMessages((prevMessages) => [...prevMessages, leaveMessage]);
  //       setClientId(null);
  //     });

  //     socket.on(
  //       'message',
  //       (message: { text: string; sender: string; clientId: string }) => {
  //         setMessages((prevMessages) => [...prevMessages, message]);
  //       },
  //     );

  //     return () => {
  //       socket.off('connect');
  //       socket.off('user-joined');
  //       socket.off('user-left');
  //       socket.off('message');
  //     };
  //   }, []);

  //   useEffect(() => {
  //     if (clientId === null) {
  //       setClientId(socket.id || '');
  //     }
  //   }, [clientId]);

  //   const handleSendMessage = () => {
  //     if (!inputValue) return;

  //     const newMessage = { text: inputValue, clientId: clientId! };

  //     socket.emit('newMessage', newMessage);

  //     setInputValue('');
  //   };

  return (
    <>
      <h1>Messages</h1>
      {/* {messages.map((message, index) => (
        <div key={index}>
          <span>{message.clientId} : : </span>
          <span>{message.text}</span>
        </div>
      ))}

      <div>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
      </div> */}
    </>
  );
};

export default Chat;
