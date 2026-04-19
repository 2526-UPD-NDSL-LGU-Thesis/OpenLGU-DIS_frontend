import { http, HttpResponse } from 'msw';

export const verifyHandlers = [
    http.get('https://mock.api/user', () => {
        return HttpResponse.json({
            id: 'abc-123',
            firstName: 'John',
            lastName: 'Maverick',
        })
    })
];