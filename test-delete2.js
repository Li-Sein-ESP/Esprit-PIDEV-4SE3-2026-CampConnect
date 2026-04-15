const http = require('http');

const loginData = JSON.stringify({
    username: "admin",
    password: "admin123" 
});

const req = http.request({
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
                console.log("Got token.");
                getVideos(result.token);
            }
        } catch (e) {
            console.error("Parse error:", e);
        }
    });
});

req.write(loginData);
req.end();

function getVideos(token) {
    http.get('http://localhost:8082/api/academy/videos', (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            const videos = JSON.parse(rawData);
            if (videos.length > 0) {
                const videoId = videos[videos.length - 1].id;
                console.log("Attempting to delete video:", videoId);
                deleteVideo(token, videoId);
            }
        });
    });
}

function deleteVideo(token, id) {
    const req = http.request({
        hostname: 'localhost',
        port: 8082,
        path: '/api/academy/videos/' + id,
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        }
    }, (res) => {
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            console.log("DELETE status code:", res.statusCode);
            console.log("DELETE headers:", res.headers);
            console.log("DELETE response:", rawData);
        });
    });
    
    req.on('error', (e) => {
        console.error("DELETE request error:", e);
    });
    
    req.end();
}
