import SchoolVisionMission from "../../components/Common/SchoolVisionMission.jsx";
import React from "react";
import "../Dashboard.css";
import "./NonTeachingStaffDeshboard.css";

function NonTeachingStaffDashboard() {

  const username = localStorage.getItem("username");

  return (
    <div className="dashboard">

      <aside className="dashboard-sidebar">

        <h2>
          {`Staff Panel ${username}`}
        </h2>

        <button>
          Dashboard
        </button>

        <button>
          Students
        </button>

        <button>
          Documents
        </button>

        <button>
          Notices
        </button>

        <button>
          Reports
        </button>

      </aside>


      <main className="dashboard-content">

        <h1>
          Welcome, {username || "Staff"}
        </h1>

        <SchoolVisionMission />
      </main>

    </div>
  );
}

export default NonTeachingStaffDashboard;