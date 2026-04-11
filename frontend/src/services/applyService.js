export const applyToJob = async (jobId, source) => {
    const token = localStorage.getItem("access");

    const response = await fetch(
        "http://localhost:8000/api/applications/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                job_id: jobId,
                job_source: source === "local" ? "user" : "company"
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.detail || "Something went wrong");
    }

    return data;
};