
import { useState } from "react";
import { pingBackend } from "#/api/pingService.js";


export function PingBackend(){
  const [pingStatus, setPingStatus] = useState<string>("Not tested yet")
   return (
    <>
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
   ); 
}