const socket = io();

const roomInputDiv = document.querySelector('#room-input');
const roomInputTemplate = document.querySelector('#room-template').innerHTML;

socket.emit('getRooms', (rooms) => { 
    const html = Mustache.render(roomInputTemplate, {
        rooms
    })
    roomInputDiv.innerHTML = html;
})