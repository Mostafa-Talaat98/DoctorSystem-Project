import { createToken, verifyToken } from './utils/security/jwtToken.js';

console.log('Testing jwtToken module...');

try {
    const token = createToken({ id: 123 });
    console.log('Token created:', token);

    const decoded = verifyToken(token);
    console.log('Token verified:', decoded);

    if (decoded.id === 123) {
        console.log('SUCCESS: Token logic working.');
    } else {
        console.log('FAILED: Token payload mismatch.');
    }
} catch (error) {
    console.error('ERROR:', error);
}
