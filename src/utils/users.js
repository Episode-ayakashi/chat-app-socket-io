const users = [];

const addUser = ({ id, username, room }) => { 
    // Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validation
    if (!username || !room) { 
        return {
            error: 'Username and Room are required!'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => { 
        return user.room == room && user.username == username
    })
    // validate username
    if (existingUser) { 
        return {
            error: 'Username is in use!'
        }
    }

    // [green]
    const user = { id, username, room }
    users.push(user);
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id == id)
    if (index != -1) { 
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => { 
    return users.find((user) => user.id == id);
}

const getUsersInRoom = (room) => { 
    return users.filter((user) => user.room == room);
}

const getRooms = () => { 
    const rooms = users.map((user) => {
        return user.room
    })
    const uniqueRooms = rooms.filter((v,i,a)=>a.indexOf(v)==i);
    return uniqueRooms;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}