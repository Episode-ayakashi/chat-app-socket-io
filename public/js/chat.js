const socket = io();

// [VARS]
ui = {
    input_message: document.querySelector('#input-message'),
    input_form: document.querySelector('#input-form'),
    input_location: document.querySelector('#send-location'),
    list_messages: document.querySelector('#messages'),
    sidebar: document.querySelector('#sidebar')
}

templates = {
    message: document.querySelector('#message-template').innerHTML,
    location_message: document.querySelector('#location-message-template').innerHTML,
    sidebar: document.querySelector('#sidebar-template').innerHTML
}

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }); // basically get us [req.params.element] in js(instead of node/expr).

// function
function autoScroll() { 
    // new message of the screen
    const newMessage = ui.list_messages.lastElementChild;
    // new message's height
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    // visible message_list height
    const visibleHeight = ui.list_messages.offsetHeight;
    // whole message_list height
    const containerHeight = ui.list_messages.scrollHeight;

    // how far have i scrolled
    const scrollOffSet = ui.list_messages.scrollTop + visibleHeight;
    console.log(containerHeight - newMessageHeight)
    console.log(scrollOffSet)
    if (containerHeight - newMessageHeight <= (scrollOffSet + 10)) { 
        ui.list_messages.scrollTop = containerHeight;
    }
}

// [EMIT EVERY]
socket.emit('join', { username, room }, (error) => { 
    if (error) { 
        alert(error);
        location.href = '/';
    }
});

// [ON]
socket.on('message', (message) => { 
    const html = Mustache.render(templates.message, {
        username: message.username,
        message: message.text, // key: value
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    ui.list_messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('locationMessage', (lMessage) => { 
    const linkHtml = Mustache.render(templates.location_message, {
        username: lMessage.username,
        url: lMessage.url,
        createdAt: moment(lMessage.createdAt).format('h:mm a'),
    })
    ui.list_messages.insertAdjacentHTML('beforeend', linkHtml);
    autoScroll();
})

socket.on('roomData', ({ room, users }) => { 
    const html = Mustache.render(templates.sidebar, {
        room,
        users
    })
    ui.sidebar.innerHTML = html;
})

// [EMIT on ACTION]
ui.input_form.addEventListener('submit', (e) => { 
    e.preventDefault()
    ui.input_message.setAttribute('disabled', '')
    
    socket.emit('sendMessage', { message: ui.input_message.value }, (error) => { 
        ui.input_message.removeAttribute('disabled')
        ui.input_message.value = '';
        ui.input_message.focus();

        if (error) { 
            return console.log(error);
        }
        console.log('Message delivered!');
    });
})

ui.input_location.addEventListener('click', () =>{
    if (!navigator.geolocation) { 
        return alert('Geolocation is not supported on you browser.')
    }

    ui.input_location.setAttribute('disabled', '');
    
    navigator.geolocation.getCurrentPosition((position) => { 
        socket.emit('sendLocation', { 
            lati: position.coords.latitude,
            long: position.coords.longitude,
        }, () => { 
            ui.input_location.removeAttribute('disabled');
            console.log('Location shared!')    
        });
    })
})
