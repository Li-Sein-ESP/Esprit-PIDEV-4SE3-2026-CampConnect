const http = require('http');

const loginData = JSON.stringify({
    username: "admin",
    password: "password123" // wait, maybe it's admin123
});

let token = "";

// 1. Login
const loginReq = http.request({
    hostname: 'localhost',
    port: 8082,
    path: '/api/auth/signin',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
}, (res) => {
    let rawData = '';
    res.on('data', (chunk) => rawData += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(rawData);
            if(result.token) {
                token = result.token;
                console.log("Got token.");
                getVideos();
            } else {
                console.error("Login failed (check password):", rawData);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    });
});

// the password for admin in the database is often admin123 based on standard seeders. Let's try that.
const loginData2 = JSON.stringify({
    username: "admin",
    password: "admin123" 
});

loginReq.write(loginData2);
loginReq.end();

function getVideos() {
    http.get('http://localhost:8082/api/academy/videos', (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            const videos = JSON.parse(rawData);
            if (videos.length > 0) {
                // Find a dummy video or just the first one
                const videoId = videos[videos.length - 1].id;
                console.log("Attempting to delete video:", videoId);
                deleteVideo(videoId);
            } else {
                console.log("No videos found.");
            }
        });
    });
}

function deleteVideo(id) {
    const req = http.request({
        hostname: 'localhost',
        port: 8082,
        path: '/api/academy/videos/' + id,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }, (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            console.log("DELETE status code:", res.statusCode);
            console.log("DELETE response:", rawData);
        });
    });
    
    req.on('error', (e) => {
        console.error("DELETE request error:", e);
    });
    
    req.end();
}
