import { it, expect } from 'vitest';

it('responds with the user', async () => {
    const response = await fetch('https://mock.api/user');
    
    await expect(response.json()).resolves.toEqual({
        id: 'abc-123',
        firstName: 'John',
        lastName: 'Maverick',
    })
});