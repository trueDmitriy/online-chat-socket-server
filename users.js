let users = [];

const normalize = (value = "") => String(value).trim().toLowerCase();

const findUser = (username, room) => {
  const userName = normalize(username);
  const userRoom = normalize(room);

  return users.find(
    (u) => normalize(u.username) === userName && normalize(u.room) === userRoom,
  );
};

const addUser = ({ username = "", room = "" }) => {
  const isExisting = findUser(username, room);

  const user = { username: String(username).trim(), room: String(room).trim() };

  !isExisting && users.push(user);

  const currentUser = isExisting || user;

  return { isExisting: !!isExisting, user: currentUser };
};

const removeUser = (username, room) => {
  const user = findUser(username, room);

  if (user) {
    users = users.filter(
      (u) =>
        (u.room === user.room && u.name !== user.name) || u.room !== user.room,
    );
  }

  return user;
};

const getRoomUsers = (room) => {
  return users.filter((u) => normalize(u.room) === normalize(room));
};

module.exports = { addUser, findUser, getRoomUsers, removeUser };
