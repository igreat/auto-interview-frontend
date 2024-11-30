import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TODO: have a video/gif background for each job description (company) (based on selection)

function Home() {
    const [selectedJob, setSelectedJob] = useState('');
    const [uploadedCV, setUploadedCV] = useState(null);
    const navigate = useNavigate();

    const jobDescriptions = {
        developer: 'Develops and maintains software applications.',
        designer: 'Designs user interfaces and experiences.',
        manager: 'Oversees projects and teams to ensure timely delivery.',
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        setUploadedCV(file);
        console.log('Uploaded CV:', file); // Replace with your handling logic
    };

    const handleJobChange = (event) => {
        setSelectedJob(event.target.value);
    };

    const handleConfirm = () => {
        if (!uploadedCV) {
            alert('Please upload a CV before confirming.');
            return;
        }
        console.log('CV confirmed:', uploadedCV.name);
        alert(`CV "${uploadedCV.name}" confirmed successfully!`);
        navigate('/interview');
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-center mb-6">Drop Your CV & Choose a Job</h1>

            {/* File Upload Section */}
            <div
                className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center mb-4"
                onClick={() => document.getElementById('cv-upload-input').click()}
            >
                <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    id="cv-upload-input"
                    className="hidden"
                />
                <p className="text-gray-500">
                    {uploadedCV
                        ? `Uploaded: ${uploadedCV.name}`
                        : 'Drop your CV here or click to upload'}
                </p>
            </div>

            {/* Confirm Button */}
            <button
                onClick={handleConfirm}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
                Confirm
            </button>

            {/* Job Description Selection */}
            <div className="mt-6">
                <label
                    htmlFor="job-select"
                    className="block text-gray-700 font-medium mb-2"
                >
                    Select a Job Description:
                </label>
                <select
                    id="job-select"
                    onChange={handleJobChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                >
                    <option value="">-- Select a Job --</option>
                    {Object.keys(jobDescriptions).map((job) => (
                        <option key={job} value={job}>
                            {job.charAt(0).toUpperCase() + job.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display Selected Job Description */}
            {selectedJob && (
                <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <h3 className="text-lg font-semibold mb-2">Job Description:</h3>
                    <p className="text-gray-600">{jobDescriptions[selectedJob]}</p>
                </div>
            )}
        </div>
    );
}

export default Home;