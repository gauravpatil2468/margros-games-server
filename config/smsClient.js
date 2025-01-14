import axios from 'axios';

// Function to send SMS using Fast2SMS
const sendSMS = async (toPhoneNumbers, message) => {
    const API_KEY = 'jbXqFwvY5Ik9e0pT6ECZrQJ8NsAKHPn3RicuzV1aUtgmLWD7xM6wqySNLdRb3jQDJVXGTIcE2p0tBnWK'; // Replace with your Fast2SMS API Key
    const url = 'https://www.fast2sms.com/dev/bulkV2'; // New endpoint

    // Prepare the request body
    const data = {
        message: message, // The message you want to send
        language: 'english', // Language of the message (default to english)
        route: 'q', // Quick SMS route, you can change this if needed
        numbers: toPhoneNumbers, // Comma-separated phone numbers (e.g. '9999999999,8888888888')
    };

    try {
        const response = await axios.post(url, new URLSearchParams(data), {
            headers: {
                'authorization': API_KEY, // Fast2SMS API Key in authorization header
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        
        console.log(response.data); // You can log or process the response
        return response.data; // Response contains the status of the sent message
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { error: 'Failed to send SMS' };
    }
};

export default sendSMS;
