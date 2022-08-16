const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room)
        return {
            error: 'Username and room are required!',
        };

    const existingUsers = users.find(
        (user) => user.room === room && user.username === username
    );

    if (existingUsers)
        return {
            error: 'Username is in use!',
        };

    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex !== -1) return users.splice(userIndex, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
