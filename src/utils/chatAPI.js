const API_KEY = import.meta.env.VITE_API_KEY;

export const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${API_KEY}` },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Transcription failed");
    }

    return response.json();
};

export const generateSpeech = async (inputText) => {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "tts-1",
            voice: "alloy", // Choose a voice from OpenAI's available options
            input: inputText,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "TTS generation failed");
    }

    // Convert the response into a Blob
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob); // Create a URL for audio playback
};

export const getChatResponse = async (text, system_prompt) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: system_prompt || `
                    You will be getting audio transcripts of the interviewees answering your questions,  and you are acting as an interviewer whose job is to ask concise questions aimed at helping the interviewee getting to the most optimal, efficient answer and you will be trying to nudge them in the correct direction when needed. 
                    Tech,"Design a scalable URL shortening service similar to Bitly. The service should take a long URL and convert it into a shorter, unique URL. Users should be able to use the shortened URL to redirect to the original long URL. The system should be highly scalable, handle a large number of requests, and ensure high availability.","Requirements Understanding First, I'll clarify the requirements. The service should allow users to shorten long URLs, redirect short URLs to the original ones, support custom aliases, and provide analytics. Non-functional requirements include high scalability to handle millions of requests daily, high availability, low latency, and consistency in URL mappings. High-Level Architecture The system consists of the following components: * API Layer: Handles requests for shortening URLs and redirections. * Service Layer: Includes the URL shortening service and redirection service. * Database: Stores the mappings between short and long URLs. * Caching Layer: Uses Redis to cache frequent URL mappings for quick access. * Load Balancer: Distributes incoming traffic across multiple servers. * CDN: Caches redirection responses to reduce latency. * Analytics Service: Collects and processes usage data asynchronously. Detailed Component Design * URL Shortening Algorithm: I'll use Base62 encoding to convert unique numeric IDs into short strings. To ensure uniqueness, a centralized auto-incrementing ID or a distributed ID generator like Snowflake can be utilized. * Database Design: A NoSQL database like DynamoDB is suitable for high read/write throughput. The schema includes fields like id, long_url, short_url, creation_date, and custom_alias. * Caching Strategy: Implement a read-through cache with Redis. When a redirect request is made, the system first checks the cache; if not found, it queries the database and updates the cache. Scalability and Performance * Load Balancing: Use NGINX or AWS ELB to distribute traffic across multiple service instances. * Horizontal Scaling: Deploy multiple instances of each service component to handle increased load. * Database Sharding: Partition the database based on the short URL key to distribute the load effectively. * Asynchronous Processing: Use Kafka for handling analytics data without blocking the main request flow. Redundancy and Fault Tolerance * Data Replication: Replicate databases across multiple availability zones to ensure high availability. * Service Redundancy: Run multiple instances of each service to prevent single points of failure. * Health Monitoring: Implement health checks and automatic failover mechanisms. Security Considerations * Input Validation: Ensure all URLs are valid and sanitize inputs to prevent malicious content. * Rate Limiting: Protect the service from abuse by limiting the number of requests per user/IP. * HTTPS: Secure all data in transit with SSL/TLS. Workflow * Shortening a URL: User submits a long URL via the API. The service generates a unique ID, encodes it using Base62, stores the mapping in the database, and returns the short URL. * Redirecting: When a short URL is accessed, the system checks Redis cache for the long URL. If found, it redirects immediately; otherwise, it queries the database, updates the cache, and then redirects. Optimization and Monitoring * Database Optimization: Index the short_url field for faster lookups and use read replicas to handle high read traffic. * Monitoring: Use tools like Prometheus and Grafana to monitor system performance and set up alerts for any issues. Conclusion By leveraging a scalable architecture with efficient encoding algorithms, robust caching, and distributed databases, the URL shortening service can handle high traffic with low latency and ensure high availability. Implementing redundancy and security measures further strengthens the system's reliability and integrity."
                    `,  
                },
                { role: "user", content: text }
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Interview response failed");
    }

    return response.json();
};