import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoBackground from './VideoBackground';
import TechVideo from './assets/Tech.mp4';
import BankVideo from './assets/BankofAmerica.mp4';
import PharmaVideo from './assets/Pharma.mp4';

// TODO: have a video/gif background for each job description (company) (based on selection)

const API_ENDPOINT = "http://127.0.0.1:5000";

function Home() {
    const [selectedJob, setSelectedJob] = useState('');
    const [uploadedCV, setUploadedCV] = useState(null);
    const navigate = useNavigate();

    const jobDescriptions = {
        developer: {
            description: 'We are seeking a talented Software Engineer to design, implement, and maintain scalable, high-availability systems capable of handling millions of users. You will work on projects like developing a URL shortening service, focusing on efficient redirection mechanisms, unique URL generation, and robust data storage solutions. The role involves optimizing performance, ensuring fault tolerance, and adhering to best practices in distributed systems design, API development, and system security. Candidates should have a strong background in programming (Python, Java, or Go), database technologies (e.g., MySQL, Redis), cloud platforms (AWS, Azure, or Google Cloud), and scalable architecture patterns. Familiarity with load balancing, caching strategies, and CI/CD pipelines is essential. This is an exciting opportunity to collaborate with a cross-functional team, write clean and testable code, and contribute to cutting-edge, innovative systems in a fast-paced, growth-oriented environment.',
            video: TechVideo,
        },
        Trader: {
            description: 'We are seeking a skilled **Equity Trader** to analyze and capitalize on market movements in response to economic events and policy changes. In this role, you will monitor equity markets closely, interpret macroeconomic indicators such as interest rate hikes, and develop trading strategies to optimize profitability. You should possess deep knowledge of market dynamics, risk management, and the impact of monetary policy on equity valuations. Strong decision-making skills and the ability to execute trades swiftly in high-pressure environments are essential. Ideal candidates have experience deploying strategies like hedging, sector rotation, or leveraging derivatives to profit from market volatility, ensuring consistent performance even amidst unexpected economic shifts.',
            video: BankVideo,
        },
        Pharamcist: {
            description: 'We are looking for a dedicated Medical Research Specialist to lead efforts in understanding and advancing treatments for Type 2 diabetes. The role involves staying abreast of emerging therapies, evaluating clinical research, and collaborating with multidisciplinary teams to develop and implement innovative solutions. You will analyze advancements in pharmacological treatments, such as GLP-1 receptor agonists, and technological innovations like continuous glucose monitoring systems, translating these into actionable insights to improve patient care. The ideal candidate will possess strong expertise in endocrinology, clinical trial methodologies, and chronic disease management, combined with a passion for improving patient outcomes through evidence-based strategies.',
            video: PharmaVideo,
        },
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedCV(file);
        console.log('Uploaded CV:', file);
    };

    const handleJobChange = (event) => {
        setSelectedJob(event.target.value);
    };

    const handleGetQuestion = async () => {
        // post request to get question based on selected job with json body
        console.log('Getting question for job:', selectedJob);
        const response = await fetch(`${API_ENDPOINT}/getQuestion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ job: selectedJob }),
        });

        if (!response.ok) {
            console.error('Failed to get question:', response.statusText);
            return;
        }

        const data = await response.json();
        console.log('Question:', data.response);

        // Navigate to interview page
        await navigate('/interview');
    };

    const selectedVideo =
        selectedJob && jobDescriptions[selectedJob]
            ? jobDescriptions[selectedJob].video
            : TechVideo;

    return (
        <div className="relative h-screen">
            {/* Video Background */}
            <VideoBackground videoSource={selectedVideo} />

            {/* Title with Royal Blue Box */}
            <div className="w-full bg-[#4169e1]/90 py-4 relative z-20">
                <h1
                    className="text-5xl font-extrabold text-center text-white"
                    style={{ fontFamily: 'Times New Roman, serif' }}
                >
                    Interview Auto
                </h1>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-8 relative z-10">
                <div className="grid grid-cols-2 gap-8">
                    {/* File Upload Section */}
                    <div
                        className="border-2 border-blue-300 p-6 rounded-3xl bg-blue-200/70 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:opacity-100 opacity-90 flex flex-col justify-center items-center"
                        onClick={() => document.getElementById('cv-upload-input').click()}
                    >
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileUpload}
                            id="cv-upload-input"
                            className="hidden"
                        />
                        <p
                            className="text-blue-700 font-bold text-lg"
                            style={{ fontFamily: 'Times New Roman, serif' }}
                        >
                            {uploadedCV
                                ? `Uploaded: ${uploadedCV.name}`
                                : 'Drop your CV here or click to upload'}
                        </p>
                    </div>

                    {/* Job Description Selection */}
                    <div className="flex flex-col bg-blue-200/70 p-6 rounded-3xl border-2 border-blue-300 shadow-lg hover:shadow-2xl transition-shadow">
                        <label
                            htmlFor="job-select"
                            className="block text-blue-700 font-bold text-lg mb-3"
                            style={{ fontFamily: 'Times New Roman, serif' }}
                        >
                            Select a Job Description:
                        </label>
                        <select
                            id="job-select"
                            onChange={handleJobChange}
                            className="w-full border border-blue-300 bg-white rounded-full p-3 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{ fontFamily: 'Times New Roman, serif' }}
                        >
                            <option value="">-- Select a Job --</option>
                            {Object.keys(jobDescriptions).map((job) => (
                                <option key={job} value={job}>
                                    {job.charAt(0).toUpperCase() + job.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedJob && (
                    <div className="bg-blue-200/70 p-8 rounded-3xl mt-8 shadow-lg hover:shadow-2xl transition-shadow border-2 border-blue-300">
                        <h3
                            className="text-2xl font-bold mb-4 text-blue-700"
                            style={{ fontFamily: 'Times New Roman, serif' }}
                        >
                            Job Description:
                        </h3>
                        <p
                            className="text-blue-600 text-lg"
                            style={{ fontFamily: 'Times New Roman, serif' }}
                        >
                            {jobDescriptions[selectedJob].description}
                        </p>
                    </div>
                )}

                {uploadedCV && selectedJob && (

                    <button
                        onClick={handleGetQuestion}
                        className="mt-8 mx-auto px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg text-lg font-semibold"
                    >
                        Ready for the Interview?
                    </button>
                )}
            </div>
        </div>
    );
}

export default Home;