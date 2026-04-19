import { VerificationPage } from "./pages/VerificationPage";
import ThemeToggle from "./components/ThemeToggle";

import { useState } from "react";
import { pingBackend } from "./api/pingService.js";

function App() {
  const [pingStatus, setPingStatus] = useState<string>("Not tested yet")

  return (
    <>
      <ThemeToggle />
      <VerificationPage />
      <div>
        <p>Backend Status: {pingStatus}</p>
        <button
          onClick={async () => {
            const result = await pingBackend()
            setPingStatus(result.message)
          }}>
            Ping
        </button>
      </div>
    </>
  )
}

export default App
