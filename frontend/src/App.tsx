import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import "./App.css";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !company || !role) return;

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("company", company);
    formData.append("role", role);

    setLoading(true);

    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="center-box">
        <h1>Virtual AI Interview Simulation</h1>
        <p className="subtitle">AI-Powered Resume Intelligence</p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="form-card">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <select value={company} onChange={(e) => setCompany(e.target.value)}>
            <option value="">Select Company</option>
            <option value="Google">Google</option>
            <option value="Infosys">Infosys</option>
            <option value="Startup">Startup</option>
          </select>

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Auto Detect">Auto Detect</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Data Analyst">Data Analyst</option>
            <option value="ML Engineer">ML Engineer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
          </select>

          <button type="submit">
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {/* DASHBOARD */}
        {result && (
          <div className="dashboard-layout">

            {/* LEFT PANEL */}
            <div className="left-panel">

              {/* SCORE */}
              <div className="score-card">
                <div className="score-circle">
                  {result.overall_match_score}%
                </div>
                <p className="score-label">Overall AI Match</p>
              </div>

              {/* SELECTED ROLE */}
              <div className="stack-card">
                <h3>Selected Role: {result.selected_role}</h3>
              </div>

              {/* TECH STACK */}
              <div className="stack-card">
                <h3>Detected Tech Stack</h3>
                <p><strong>Primary:</strong> {result.detected_stack?.primary_language}</p>
                <p><strong>Frameworks:</strong> {result.detected_stack?.frameworks?.join(", ")}</p>
                <p><strong>Databases:</strong> {result.detected_stack?.databases?.join(", ")}</p>
                <p><strong>Tools:</strong> {result.detected_stack?.tools?.join(", ")}</p>
              </div>

              {/* RECOMMENDED COMPANIES */}
              <div className="stack-card">
                <h3>Recommended Companies</h3>
                <ul>
                  {result.recommended_companies?.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {/* ROLE FIT CHART */}
              <div className="chart-card">
                <h3>Role Fit Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[
                      { name: "Tech", value: result.role_fit_breakdown?.technical_skills },
                      { name: "Projects", value: result.role_fit_breakdown?.project_relevance },
                      { name: "Stack", value: result.role_fit_breakdown?.stack_alignment },
                      { name: "Experience", value: result.role_fit_breakdown?.experience_depth },
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4ade80" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* RESUME SECTION RADAR */}
              <div className="chart-card">
                <h3>Resume Section Analysis</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart
                    data={[
                      { subject: "Education", value: result.resume_section_analysis?.education_score },
                      { subject: "Projects", value: result.resume_section_analysis?.projects_score },
                      { subject: "Skills", value: result.resume_section_analysis?.skills_section_score },
                      { subject: "Experience", value: result.resume_section_analysis?.experience_score },
                      { subject: "Certifications", value: result.resume_section_analysis?.certifications_score },
                    ]}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar dataKey="value" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* RIGHT PANEL */}
            <div className="right-panel">
              {[
                { key: "strengths", label: "Strengths" },
                { key: "missing_skills", label: "Skill Gaps" },
                { key: "resume_improvements", label: "Resume Enhancements" },
                { key: "interview_focus", label: "Interview Focus Areas" },
                { key: "recommended_projects", label: "Recommended Projects" },
              ].map((section) => (
                <div key={section.key} className="analysis-card">
                  <div
                    className="section-header"
                    onClick={() => toggleSection(section.key)}
                  >
                    <h3>{section.label}</h3>
                    <span>{openSection === section.key ? "▲" : "▼"}</span>
                  </div>

                  <div
                    className={`section-content ${
                      openSection === section.key ? "open" : ""
                    }`}
                  >
                    <ul>
                      {result[section.key]?.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default App;