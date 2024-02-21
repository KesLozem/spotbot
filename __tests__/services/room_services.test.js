const { createRoom } = require('../../services/room_services/createRoom.service');
const { getRooms } = require('../../services/room_services/getRooms.service');
const { deleteRoom } = require('../../services/room_services/deleteRoom.service');
const roomsDB = require('../../db/rooms.db');

jest.mock('../../db/rooms.db');

describe('Room Services', () => {
  it('should generate a room pin and create a room', async () => {
    const mockPin = '1234';
    roomsDB.generateRoomPin.mockReturnValue(mockPin);

    const result = await createRoom();

    expect(roomsDB.generateRoomPin).toHaveBeenCalled();
    expect(roomsDB.createRoom).toHaveBeenCalledWith(mockPin);
    expect(result).toBe(mockPin);
  });

  it('should delete a room with specified pin', async () => {
    const mockPin = '1234';
    roomsDB.deleteRoom.mockResolvedValue(true);

    const result = await deleteRoom(mockPin);

    expect(roomsDB.deleteRoom).toHaveBeenCalledWith(mockPin);
    expect(result).toBe(true);
  });

  it('should return an array of rooms', async () => {
    const mockRooms = ['1234', '1243', '2222'];
    roomsDB.getRooms.mockResolvedValue(mockRooms);

    const result = await getRooms();

    expect(roomsDB.getRooms).toHaveBeenCalled();
    expect(result).toEqual(mockRooms);
  });
});