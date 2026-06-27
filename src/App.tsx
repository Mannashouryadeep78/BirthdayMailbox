import * as React from "react"
import BirthdayMailboxAnimation from "../BirthdayMailboxAnimation"

export default function App() {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      margin: 0,
      padding: 0,
      backgroundColor: "#FF8CCB"
    }}>
      <BirthdayMailboxAnimation
        messageWord="birthday"
        label="HAPPY"
        age="24"
        backgroundColor="#FF8CCB"
        accentColor="#FF4FA1"
        navyColor="#13294B"
        blueColor="#89BFFF"
        whiteColor="#FFFFFF"
        durationSeconds={6}
        autoReplay={false}
        replayOnClick={true}
      />
    </div>
  )
}
