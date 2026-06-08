// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Altere no seu server.js de app.use(express.static('public')) para:
app.use(express.static(__dirname)); 

io.on('connection', (socket) => {
    console.log('Um usuário conectou:', socket.id);

    // Entrar na sala (Mestre ou Jogador)
    socket.on('join-room', (roomId, role) => {
        socket.join(roomId);
        console.log(`${role} entrou na sala: ${roomId}`);
        
        // Se for jogador, avisa o mestre para iniciar a conexão de vídeo (WebRTC)
        if (role === 'player') {
            socket.to(roomId).emit('player-joined', socket.id);
        }
    });

    // Sincronização de Áudio (SFX, Tabletop Audio)
    socket.on('play-audio', (roomId, audioData) => {
        // Envia o comando de play para todos os jogadores da sala
        socket.to(roomId).emit('audio-command', audioData);
    });

    // Envio de Imagem Estática
    socket.on('send-image', (roomId, imageUrl) => {
        socket.to(roomId).emit('update-image', imageUrl);
    });

    // Sinalização WebRTC (para a câmera virtual do OBS)
    socket.on('webrtc-offer', (data) => {
        socket.to(data.target).emit('webrtc-offer', data.offer, socket.id);
    });
    socket.on('webrtc-answer', (data) => {
        socket.to(data.target).emit('webrtc-answer', data.answer);
    });
    socket.on('webrtc-ice-candidate', (data) => {
        socket.to(data.target).emit('webrtc-ice-candidate', data.candidate);
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});