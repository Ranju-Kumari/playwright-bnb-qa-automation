import { test, expect } from '../../src/fixtures/fixtures';

test.describe('Rooms API', () => {
    test('lists rooms with the fields the website needs', async ({ api }) => {
        const response = await api.getRooms();
        expect(response.status()).toBe(200);

        const { rooms } = await response.json();
        expect(rooms.length).toBeGreaterThan(0);
        for (const room of rooms) {
            expect(room).toMatchObject({
                roomid: expect.any(Number),
                roomName: expect.any(String),
                type: expect.any(String),
                roomPrice: expect.any(Number),
                features: expect.any(Array),
            });
            expect(room.roomPrice).toBeGreaterThan(0);
        }
    });

    test('includes the room types shown on the home page', async ({ api }) => {
        const { rooms } = await (await api.getRooms()).json();
        const types = rooms.map((r: { type: string }) => r.type);

        expect(types).toEqual(expect.arrayContaining(['Single', 'Double', 'Suite']));
    });
});
