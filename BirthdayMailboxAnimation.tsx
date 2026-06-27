import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useInView } from "framer-motion"

interface MyComponentProps {
    messageWord: string
    label: string
    age: string
    backgroundColor: string
    accentColor: string
    navyColor: string
    blueColor: string
    whiteColor: string
    durationSeconds: number
    autoReplay: boolean
    replayOnClick: boolean
}

// User request: Create a self-contained, full-bleed, responsive Framer component named BirthdayMailboxAnimation with a flat SVG/CSS animated mailbox + paper-plane birthday scene that transitions to a final text reveal, supports configurable text/colors/timing/replay controls, includes accessibility, and respects prefers-reduced-motion.
/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function BirthdayMailboxAnimation(props: MyComponentProps) {
    const {
        messageWord = "birthday",
        label = "HAPPY",
        age = "24",
        backgroundColor = "#FF8CCB",
        accentColor = "#FF4FA1",
        navyColor = "#13294B",
        blueColor = "#89BFFF",
        whiteColor = "#FFFFFF",
        durationSeconds = 6,
        autoReplay = true,
        replayOnClick = true,
    } = props

    const isStaticRenderer = useIsStaticRenderer()
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const inView = useInView(rootRef, { amount: 0.25 })

    const [cycle, setCycle] = React.useState(0)
    const [showFinal, setShowFinal] = React.useState(false)
    const [isReducedMotion, setIsReducedMotion] = React.useState(false)
    const [isTriggered, setIsTriggered] = React.useState(false)
    const [currentSlide, setCurrentSlide] = React.useState(0)

    const safeDuration = React.useMemo(
        () => Math.max(2, durationSeconds),
        [durationSeconds]
    )
    const sceneFadeAtMs = React.useMemo(
        () => safeDuration * 1000 * 0.80,
        [safeDuration]
    )
    const fullCycleMs = React.useMemo(() => safeDuration * 1000, [safeDuration])

    React.useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia) {
            const media = window.matchMedia("(prefers-reduced-motion: reduce)")
            const update = () => {
                React.startTransition(() => setIsReducedMotion(media.matches))
            }
            update()
            media.addEventListener("change", update)
            return () => media.removeEventListener("change", update)
        } else {
            React.startTransition(() => setIsReducedMotion(false))
        }
    }, [])

    React.useEffect(() => {
        if (isStaticRenderer || isReducedMotion) {
            React.startTransition(() => {
                setShowFinal(true)
                setIsTriggered(true)
            })
            return
        }

        if (!isTriggered) {
            React.startTransition(() => setShowFinal(false))
            return
        }

        React.startTransition(() => setShowFinal(false))
        const fadeTimer = window.setTimeout(() => {
            React.startTransition(() => setShowFinal(true))
        }, sceneFadeAtMs)

        let replayTimer = 0
        if (autoReplay) {
            replayTimer = window.setTimeout(() => {
                React.startTransition(() => setCycle((v) => v + 1))
            }, fullCycleMs + 300)
        }

        return () => {
            window.clearTimeout(fadeTimer)
            if (replayTimer) window.clearTimeout(replayTimer)
        }
    }, [
        autoReplay,
        cycle,
        fullCycleMs,
        isReducedMotion,
        isStaticRenderer,
        sceneFadeAtMs,
        isTriggered,
    ])

    const handleReplay = React.useCallback(() => {
        if (isStaticRenderer || isReducedMotion) return
        if (!isTriggered) {
            React.startTransition(() => setIsTriggered(true))
            return
        }
        if (!replayOnClick) return
        React.startTransition(() => {
            setShowFinal(false)
            setCycle((v) => v + 1)
        })
    }, [isReducedMotion, isStaticRenderer, replayOnClick, isTriggered])

    const playState =
        inView && !isReducedMotion && !isStaticRenderer
            ? "running"
            : "paused"

    const scenePlayState =
        isTriggered && inView && !showFinal && !isReducedMotion && !isStaticRenderer
            ? "running"
            : "paused"

    const finalPlayState =
        isTriggered && inView && !isReducedMotion && !isStaticRenderer
            ? "running"
            : "paused"

    const interactive = (!isTriggered || replayOnClick) && !isReducedMotion && !isStaticRenderer

    return (
        <div
            ref={rootRef}
            role={interactive ? "button" : "img"}
            tabIndex={interactive ? 0 : -1}
            aria-label={`Animated birthday greeting: a paper airplane flies into a mailbox and reveals ${label} ${messageWord} ${age}`}
            onClick={handleReplay}
            onKeyDown={(event) => {
                if (!interactive) return
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    handleReplay()
                }
            }}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: backgroundColor,
                display: "block",
                cursor: interactive ? "pointer" : "default",
                outline: "none",
            }}
        >
            <style>{`
                @keyframes bmaPlaneFly {
                    0% { transform: translate(1300px, -50px) rotate(15deg) scale(0.5); opacity: 0; }
                    3% { opacity: 1; }
                    22% { transform: translate(200px, 260px) rotate(-10deg) scale(0.7); }
                    44% { transform: translate(950px, 140px) rotate(-165deg) scale(0.6); }
                    62% { transform: translate(250px, 620px) rotate(15deg) scale(0.75); }
                    70% { transform: translate(850px, 450px) rotate(-195deg) scale(0.7); }
                    74% { transform: translate(1050px, 280px) rotate(15deg) scale(0.6); opacity: 1; }
                    78% { transform: translate(730px, 330px) rotate(10deg) scale(0.4); opacity: 1; }
                    82% { transform: translate(580px, 345px) rotate(5deg) scale(0.05); opacity: 0; }
                    100% { transform: translate(580px, 345px) rotate(5deg) scale(0.05); opacity: 0; }
                }
                @keyframes bmaDoorOpen {
                    0%, 64% { transform: rotateX(0deg); }
                    73% { transform: rotateX(-74deg); }
                    100% { transform: rotateX(-74deg); }
                }
                @keyframes bmaSceneExit {
                    0%, 100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes bmaFinalEnter {
                    0%, 82% { opacity: 0; transform: translateY(8px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes bmaBearDance {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-6px) rotate(-4deg); }
                    50% { transform: translateY(-1px) rotate(0deg); }
                    75% { transform: translateY(-6px) rotate(4deg); }
                }
                @keyframes bmaBearLeftArm {
                    0% { transform: rotate(15deg); }
                    100% { transform: rotate(-55deg); }
                }
                @keyframes bmaBearRightArm {
                    0% { transform: rotate(-15deg); }
                    100% { transform: rotate(55deg); }
                }
                @keyframes bmaLionDance {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-7px) rotate(4deg); }
                    50% { transform: translateY(-2px) rotate(0deg); }
                    75% { transform: translateY(-7px) rotate(-4deg); }
                }
                @keyframes bmaLionLeftArm {
                    0% { transform: rotate(-15deg); }
                    100% { transform: rotate(55deg); }
                }
                @keyframes bmaLionRightArm {
                    0% { transform: rotate(15deg); }
                    100% { transform: rotate(-55deg); }
                }
                @keyframes bmaPulse {
                    0% { transform: scale(0.95); opacity: 0.6; }
                    50% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.6; }
                }
                @keyframes bmaGiraffeDance {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-4px) rotate(-3deg); }
                    50% { transform: translateY(-1px) rotate(0deg); }
                    75% { transform: translateY(-4px) rotate(3deg); }
                }
                @keyframes bmaCheetahDance {
                    0%, 100% { transform: translateY(0) scaleY(1); }
                    33% { transform: translateY(-8px) scaleY(0.95); }
                    66% { transform: translateY(1px) scaleY(1.03); }
                }
                @keyframes bmaDeerDance {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-5px) rotate(5deg); }
                    50% { transform: translateY(0) rotate(0deg); }
                    75% { transform: translateY(-5px) rotate(-5deg); }
                }
                @keyframes bmaCowDance {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-4px) rotate(-4deg); }
                    50% { transform: translateY(0) rotate(0deg); }
                    75% { transform: translateY(-4px) rotate(4deg); }
                }
                @keyframes bmaSheepDance {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-9px) scale(0.97, 1.05); }
                }
                @keyframes bmaFoxDance {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(-6px) rotate(-6deg); }
                    50% { transform: translateY(0) rotate(0deg); }
                    75% { transform: translateY(-6px) rotate(6deg); }
                }
                @keyframes bmaBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(6px); }
                }
            `}</style>

            {/* Unread Mail Notification Banner */}
            <div
                style={{
                    position: "absolute",
                    top: "clamp(12px, 3.5vh, 32px)",
                    left: "50%",
                    transform: isTriggered 
                        ? "translate(-50%, -30px)" 
                        : "translate(-50%, 0)",
                    opacity: isTriggered ? 0 : 1,
                    pointerEvents: isTriggered ? "none" : "auto",
                    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "rgba(255, 255, 255, 0.88)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: `1.5px solid ${accentColor}`,
                    boxShadow: "0 10px 25px -5px rgba(19, 41, 75, 0.12), 0 8px 16px -6px rgba(19, 41, 75, 0.08)",
                    padding: "10px 18px",
                    borderRadius: "30px",
                    zIndex: 10,
                    cursor: "pointer",
                    userSelect: "none",
                }}
                onClick={handleReplay}
                aria-hidden="true"
            >
                {/* Envelope Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                </svg>
                
                {/* Notification Text */}
                <span style={{
                    fontFamily: '"League Spartan", Montserrat, sans-serif',
                    fontSize: "clamp(12px, 1.6vw, 15px)",
                    fontWeight: 700,
                    color: navyColor,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap"
                }}>
                    you have an unread mail from Shouryadeep
                </span>
                
                {/* Pulsating unread indicator */}
                <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#FF0000",
                    display: "inline-block",
                    animation: isReducedMotion || isStaticRenderer
                        ? "none"
                        : "bmaPulse 1.6s infinite ease-in-out"
                }} />
            </div>

            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                <div
                    key={cycle}
                    style={{
                        position: "absolute",
                        inset: 0,
                    animation:
                        isReducedMotion || isStaticRenderer
                            ? "none"
                            : `bmaSceneExit ${safeDuration}s linear forwards`,
                    animationPlayState: scenePlayState,
                    pointerEvents: "none",
                }}
            >
                <svg
                    viewBox="0 0 1200 800"
                    width="100%"
                    height="100%"
                    aria-hidden="true"
                    style={{ display: "block" }}
                    preserveAspectRatio="xMidYMid meet"
                >
                    <line
                        x1="0"
                        y1="620"
                        x2="1200"
                        y2="620"
                        stroke={accentColor}
                        strokeWidth="8"
                    />

                    {/* Background Forest (Trees and Bushes) */}
                    <g id="bmaBackgroundForest">
                        {/* Bushes (Cherry red ground cover) */}
                        <ellipse cx="150" cy="620" rx="60" ry="30" fill="#FF4FA1" opacity="0.55" stroke={navyColor} strokeWidth="3" />
                        <ellipse cx="380" cy="620" rx="50" ry="25" fill="#FF4FA1" opacity="0.55" stroke={navyColor} strokeWidth="3" />
                        <ellipse cx="600" cy="620" rx="70" ry="35" fill="#FF4FA1" opacity="0.55" stroke={navyColor} strokeWidth="3" />
                        <ellipse cx="820" cy="620" rx="55" ry="28" fill="#FF4FA1" opacity="0.55" stroke={navyColor} strokeWidth="3" />
                        <ellipse cx="1050" cy="620" rx="50" ry="25" fill="#FF4FA1" opacity="0.55" stroke={navyColor} strokeWidth="3" />

                        {/* Tree 1 (Pine) x=100 - Big Cherry Red */}
                        <rect x="94" y="380" width="12" height="240" fill={navyColor} />
                        <polygon points="20,420 180,420 100,320" fill="#C2185B" stroke={navyColor} strokeWidth="4" />
                        <polygon points="35,340 165,340 100,240" fill="#C2185B" stroke={navyColor} strokeWidth="4" />
                        <polygon points="50,260 150,260 100,160" fill="#C2185B" stroke={navyColor} strokeWidth="4" />

                        {/* Tree 2 (Round) x=260 - Big Pink-Cherry */}
                        <rect x="254" y="340" width="12" height="280" fill={navyColor} />
                        <circle cx="230" cy="320" r="45" fill="#E91E63" stroke={navyColor} strokeWidth="4" />
                        <circle cx="290" cy="320" r="45" fill="#E91E63" stroke={navyColor} strokeWidth="4" />
                        <circle cx="260" cy="270" r="55" fill="#E91E63" stroke={navyColor} strokeWidth="4" />

                        {/* Tree 3 (Pine) x=420 - Big Red */}
                        <rect x="414" y="360" width="12" height="260" fill={navyColor} />
                        <polygon points="340,400 500,400 420,300" fill="#D32F2F" stroke={navyColor} strokeWidth="4" />
                        <polygon points="360,320 480,320 420,200" fill="#D32F2F" stroke={navyColor} strokeWidth="4" />

                        {/* Tree 4 (Round) x=580 - Big Dark Cherry Maroon */}
                        <rect x="574" y="300" width="12" height="320" fill={navyColor} />
                        <circle cx="540" cy="280" r="50" fill="#880E4F" stroke={navyColor} strokeWidth="4" />
                        <circle cx="620" cy="280" r="50" fill="#880E4F" stroke={navyColor} strokeWidth="4" />
                        <circle cx="580" cy="220" r="65" fill="#880E4F" stroke={navyColor} strokeWidth="4" />

                        {/* Tree 5 (Pine) x=740 - Big Red */}
                        <rect x="734" y="360" width="12" height="260" fill={navyColor} />
                        <polygon points="660,400 820,400 740,300" fill="#D32F2F" stroke={navyColor} strokeWidth="4" />
                        <polygon points="680,320 800,320 740,200" fill="#D32F2F" stroke={navyColor} strokeWidth="4" />

                        {/* Tree 6 (Round) x=900 - Big Pink-Cherry */}
                        <rect x="894" y="340" width="12" height="280" fill={navyColor} />
                        <circle cx="870" cy="320" r="45" fill="#E91E63" stroke={navyColor} strokeWidth="4" />
                        <circle cx="930" cy="320" r="45" fill="#E91E63" stroke={navyColor} strokeWidth="4" />
                        <circle cx="900" cy="270" r="55" fill="#E91E63" stroke={navyColor} strokeWidth="4" />

                        {/* Tree 7 (Pine) x=1080 - Big Cherry Red */}
                        <rect x="1074" y="380" width="12" height="240" fill={navyColor} />
                        <polygon points="1000,420 1160,420 1080,320" fill="#C2185B" stroke={navyColor} strokeWidth="4" />
                        <polygon points="1015,340 1145,340 1080,240" fill="#C2185B" stroke={navyColor} strokeWidth="4" />
                        <polygon points="1030,260 1130,260 1080,160" fill="#C2185B" stroke={navyColor} strokeWidth="4" />
                    </g>

                    <rect
                        x="560"
                        y="375"
                        width="80"
                        height="250"
                        rx="8"
                        fill={whiteColor}
                    />
                    <rect
                        x="480"
                        y="250"
                        width="260"
                        height="190"
                        rx="28"
                        fill={whiteColor}
                    />
                    <rect
                        x="498"
                        y="280"
                        width="224"
                        height="132"
                        rx="18"
                        fill={blueColor}
                    />
                    <rect
                        x="510"
                        y="292"
                        width="200"
                        height="96"
                        rx="14"
                        fill={navyColor}
                    />

                    {/* Mailbox Opening Covering */}
                    <g
                        style={{
                            opacity: isTriggered ? 0 : 1,
                            transform: isTriggered 
                                ? "scale(0.8) translateY(20px)" 
                                : "scale(1) translateY(0)",
                            pointerEvents: isTriggered ? "none" : "auto",
                            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                            transformOrigin: "610px 340px",
                            cursor: "pointer",
                        }}
                    >
                        {/* Shadow of covering */}
                        <rect
                            x="504"
                            y="286"
                            width="212"
                            height="108"
                            rx="16"
                            fill="rgba(0, 0, 0, 0.15)"
                        />
                        {/* Main white covering */}
                        <rect
                            x="500"
                            y="282"
                            width="220"
                            height="116"
                            rx="18"
                            fill={whiteColor}
                            stroke={accentColor}
                            strokeWidth="5"
                        />
                        {/* Text "Mail Box" */}
                        <text
                            x="610"
                            y="348"
                            textAnchor="middle"
                            fill={navyColor}
                            fontSize="24"
                            fontWeight="800"
                            letterSpacing="0.08em"
                            fontFamily='"League Spartan", Montserrat, sans-serif'
                        >
                            MAIL BOX
                        </text>
                        {/* Decorative mail line */}
                        <line
                            x1="530"
                            y1="370"
                            x2="690"
                            y2="370"
                            stroke={blueColor}
                            strokeWidth="3"
                            strokeDasharray="6 4"
                        />
                    </g>
                    <rect
                        x="470"
                        y="430"
                        width="280"
                        height="18"
                        rx="9"
                        fill={accentColor}
                    />

                    <g
                        style={{
                            transformOrigin: "750px 260px",
                            animation:
                                isReducedMotion || isStaticRenderer
                                    ? "none"
                                    : `bmaDoorOpen ${safeDuration}s linear forwards`,
                            animationPlayState: scenePlayState,
                        }}
                    >
                        <rect
                            x="730"
                            y="250"
                            width="50"
                            height="24"
                            rx="12"
                            fill={accentColor}
                        />
                    </g>

                    <g fill={blueColor}>
                        <ellipse
                            cx="375"
                            cy="620"
                            rx="22"
                            ry="58"
                            transform="rotate(-20 375 620)"
                        />
                        <ellipse
                            cx="410"
                            cy="622"
                            rx="20"
                            ry="50"
                            transform="rotate(16 410 622)"
                        />
                        <ellipse
                            cx="808"
                            cy="624"
                            rx="23"
                            ry="60"
                            transform="rotate(18 808 624)"
                        />
                        <ellipse
                            cx="843"
                            cy="625"
                            rx="18"
                            ry="48"
                            transform="rotate(-14 843 625)"
                        />
                    </g>

                    <g fill={whiteColor}>
                        <circle cx="314" cy="458" r="8" />
                        <circle cx="356" cy="488" r="6" />
                        <circle cx="874" cy="464" r="7" />
                        <circle cx="905" cy="502" r="6" />
                        <circle cx="262" cy="562" r="5" />
                        <circle cx="940" cy="548" r="5" />
                    </g>

                    {/* Giraffe (x=100) */}
                    <g
                        className="bmaGiraffe"
                        style={{
                            transformOrigin: "100px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaGiraffeDance 1.8s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Legs */}
                        <rect x="88" y="560" width="8" height="60" rx="4" fill="#FFD54F" stroke={navyColor} strokeWidth="3" />
                        <rect x="104" y="560" width="8" height="60" rx="4" fill="#FFD54F" stroke={navyColor} strokeWidth="3" />
                        
                        {/* Torso */}
                        <rect x="75" y="490" width="50" height="80" rx="16" fill="#FFD54F" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Neck */}
                        <rect x="92" y="385" width="16" height="115" rx="8" fill="#FFD54F" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Spots */}
                        <circle cx="85" cy="510" r="5" fill="#A16F00" />
                        <circle cx="112" cy="515" r="4" fill="#A16F00" />
                        <circle cx="95" cy="545" r="6" fill="#A16F00" />
                        <circle cx="100" cy="410" r="4" fill="#A16F00" />
                        <circle cx="102" cy="435" r="4.5" fill="#A16F00" />
                        <circle cx="98" cy="465" r="5" fill="#A16F00" />
                        
                        {/* Head */}
                        <ellipse cx="106" cy="380" rx="16" ry="12" fill="#FFD54F" stroke={navyColor} strokeWidth="4" />
                        <circle cx="112" cy="376" r="2.5" fill={navyColor} />
                        
                        {/* Ears & Horns */}
                        <line x1="96" y1="370" x2="92" y2="360" stroke={navyColor} strokeWidth="3" strokeLinecap="round" />
                        <circle cx="92" cy="358" r="3.5" fill="#A16F00" stroke={navyColor} strokeWidth="2" />
                        <line x1="102" y1="368" x2="100" y2="358" stroke={navyColor} strokeWidth="3" strokeLinecap="round" />
                        <circle cx="100" cy="356" r="3.5" fill="#A16F00" stroke={navyColor} strokeWidth="2" />
                        <path d="M 94,380 Q 86,378 92,384 Z" fill="#FFD54F" stroke={navyColor} strokeWidth="3" />
                        
                        {/* Tail */}
                        <line x1="77" y1="520" x2="68" y2="550" stroke={navyColor} strokeWidth="3" />
                        <circle cx="67" cy="552" r="3.5" fill="#A16F00" />
                    </g>

                    {/* Cheetah (x=220) */}
                    <g
                        className="bmaCheetah"
                        style={{
                            transformOrigin: "220px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaCheetahDance 1.4s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Legs */}
                        <rect x="206" y="580" width="10" height="40" rx="5" fill="#FFB03A" stroke={navyColor} strokeWidth="3" />
                        <rect x="224" y="580" width="10" height="40" rx="5" fill="#FFB03A" stroke={navyColor} strokeWidth="3" />
                        
                        {/* Torso */}
                        <rect x="190" y="508" width="60" height="80" rx="22" fill="#FFB03A" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Spots */}
                        <circle cx="205" cy="525" r="3" fill={navyColor} />
                        <circle cx="235" cy="530" r="3" fill={navyColor} />
                        <circle cx="210" cy="550" r="2.5" fill={navyColor} />
                        <circle cx="228" cy="555" r="3" fill={navyColor} />
                        <circle cx="202" cy="570" r="3" fill={navyColor} />
                        <circle cx="238" cy="565" r="2.5" fill={navyColor} />
                        
                        {/* Head */}
                        <circle cx="220" cy="482" r="22" fill="#FFB03A" stroke={navyColor} strokeWidth="4" />
                        <circle cx="212" cy="478" r="2.5" fill={navyColor} />
                        <circle cx="228" cy="478" r="2.5" fill={navyColor} />
                        <ellipse cx="220" cy="490" rx="5" ry="3" fill="#FFFFFF" />
                        <polygon points="218,488 222,488 220,491" fill={navyColor} />
                        
                        {/* Ears */}
                        <circle cx="204" cy="466" r="6" fill="#FFB03A" stroke={navyColor} strokeWidth="3" />
                        <circle cx="236" cy="466" r="6" fill="#FFB03A" stroke={navyColor} strokeWidth="3" />

                        {/* Cheeks */}
                        <circle cx="208" cy="485" r="2" fill="#FF4FA1" opacity="0.5" />
                        <circle cx="232" cy="485" r="2" fill="#FF4FA1" opacity="0.5" />
                        
                        {/* Tail */}
                        <path d="M 192,560 Q 170,555 178,530" fill="none" stroke="#FFB03A" strokeWidth="6" strokeLinecap="round" />
                        <circle cx="178" cy="530" r="4.5" fill={navyColor} />
                    </g>

                    {/* Deer (x=330) */}
                    <g
                        className="bmaDeer"
                        style={{
                            transformOrigin: "330px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaDeerDance 1.6s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Legs */}
                        <rect x="317" y="580" width="8" height="40" rx="4" fill="#C5A880" stroke={navyColor} strokeWidth="3" />
                        <rect x="335" y="580" width="8" height="40" rx="4" fill="#C5A880" stroke={navyColor} strokeWidth="3" />
                        
                        {/* Torso */}
                        <rect x="300" y="508" width="60" height="80" rx="22" fill="#C5A880" stroke={navyColor} strokeWidth="4" />
                        <circle cx="318" cy="530" r="2" fill="#FFFFFF" />
                        <circle cx="342" cy="532" r="2" fill="#FFFFFF" />
                        <circle cx="315" cy="550" r="2.5" fill="#FFFFFF" />
                        <circle cx="338" cy="552" r="2" fill="#FFFFFF" />
                        
                        {/* Head */}
                        <circle cx="330" cy="482" r="20" fill="#C5A880" stroke={navyColor} strokeWidth="4" />
                        <circle cx="322" cy="478" r="2.5" fill={navyColor} />
                        <circle cx="338" cy="478" r="2.5" fill={navyColor} />
                        <ellipse cx="330" cy="491" rx="5" ry="3.5" fill="#FFFFFF" />
                        <circle cx="330" cy="489" r="1.5" fill={navyColor} />
                        
                        {/* Antlers */}
                        <path d="M 322,464 L 314,448 M 318,456 L 310,458" stroke={navyColor} strokeWidth="3" strokeLinecap="round" />
                        <path d="M 338,464 L 346,448 M 342,456 L 350,458" stroke={navyColor} strokeWidth="3" strokeLinecap="round" />
                        
                        {/* Ears */}
                        <path d="M 314,476 Q 304,472 312,482 Z" fill="#C5A880" stroke={navyColor} strokeWidth="2.5" />
                        <path d="M 346,476 Q 356,472 348,482 Z" fill="#C5A880" stroke={navyColor} strokeWidth="2.5" />
                    </g>

                    {/* Dancing Pink Bear */}
                    <g
                        className="bmaBear"
                        style={{
                            transformOrigin: "440px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaBearDance 1.6s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Ears */}
                        <circle cx="418" cy="466" r="10" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />
                        <circle cx="418" cy="466" r="5" fill="#FF4FA1" />
                        <circle cx="462" cy="466" r="10" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />
                        <circle cx="462" cy="466" r="5" fill="#FF4FA1" />

                        {/* Left Leg */}
                        <rect x="415" y="580" width="18" height="40" rx="9" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Right Leg */}
                        <rect x="447" y="580" width="18" height="40" rx="9" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />

                        {/* Torso/Body */}
                        <rect x="410" y="508" width="60" height="80" rx="25" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />
                        <ellipse cx="440" cy="552" rx="18" ry="24" fill="#FFFFFF" opacity="0.8" />

                        {/* Head */}
                        <circle cx="440" cy="485" r="26" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Eyes */}
                        <circle cx="431" cy="482" r="3" fill={navyColor} />
                        <circle cx="449" cy="482" r="3" fill={navyColor} />
                        
                        {/* Snout & Nose */}
                        <ellipse cx="440" cy="494" rx="8" ry="5" fill="#FFFFFF" />
                        <ellipse cx="440" cy="491" rx="4" ry="2.5" fill={navyColor} />

                        {/* Blush Cheeks */}
                        <circle cx="425" cy="490" r="3" fill="#FF4FA1" opacity="0.6" />
                        <circle cx="455" cy="490" r="3" fill="#FF4FA1" opacity="0.6" />

                        {/* Left Arm (Animated) */}
                        <g
                            style={{
                                transformOrigin: "414px 525px",
                                animation: isReducedMotion || isStaticRenderer
                                    ? "none"
                                    : "bmaBearLeftArm 0.8s ease-in-out infinite alternate",
                                animationPlayState: playState,
                            }}
                        >
                            <rect x="394" y="515" width="22" height="15" rx="7" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />
                        </g>

                        {/* Right Arm (Animated) */}
                        <g
                            style={{
                                transformOrigin: "466px 525px",
                                animation: isReducedMotion || isStaticRenderer
                                    ? "none"
                                    : "bmaBearRightArm 0.8s ease-in-out infinite alternate",
                                animationPlayState: playState,
                            }}
                        >
                            <rect x="464" y="515" width="22" height="15" rx="7" fill="#FFC2D4" stroke={navyColor} strokeWidth="4" />
                        </g>
                    </g>

                    {/* Dancing Golden Lion */}
                    <g
                        className="bmaLion"
                        style={{
                            transformOrigin: "780px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaLionDance 1.6s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Tail */}
                        <path d="M 800,560 Q 835,565 830,535" fill="none" stroke={navyColor} strokeWidth="4" strokeLinecap="round" />
                        <circle cx="830" cy="532" r="7" fill="#E67300" stroke={navyColor} strokeWidth="4" />

                        {/* Mane */}
                        <path
                            d="M 780,440 C 795,440 810,445 815,460 C 830,465 830,480 825,495 C 830,510 820,525 805,525 C 790,535 770,535 755,525 C 740,525 730,510 735,495 C 730,480 730,465 745,460 C 750,445 765,440 780,440 Z"
                            fill="#E67300"
                            stroke={navyColor}
                            strokeWidth="4"
                        />

                        {/* Ears */}
                        <circle cx="760" cy="466" r="8" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />
                        <circle cx="760" cy="466" r="4" fill="#E67300" />
                        <circle cx="800" cy="466" r="8" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />
                        <circle cx="800" cy="466" r="4" fill="#E67300" />

                        {/* Left Leg */}
                        <rect x="755" y="580" width="18" height="40" rx="9" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Right Leg */}
                        <rect x="787" y="580" width="18" height="40" rx="9" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />

                        {/* Torso/Body */}
                        <rect x="750" y="508" width="60" height="80" rx="25" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />
                        <ellipse cx="780" cy="552" rx="18" ry="24" fill="#FFF8E7" />

                        {/* Head */}
                        <circle cx="780" cy="488" r="24" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Eyes */}
                        <circle cx="771" cy="485" r="3" fill={navyColor} />
                        <circle cx="789" cy="485" r="3" fill={navyColor} />
                        
                        {/* Snout & Nose */}
                        <ellipse cx="780" cy="497" rx="8" ry="5" fill="#FFF8E7" />
                        <polygon points="777,493 783,493 780,497" fill={navyColor} />

                        {/* Blush Cheeks */}
                        <circle cx="765" cy="492" r="2.5" fill="#FF4FA1" opacity="0.5" />
                        <circle cx="795" cy="492" r="2.5" fill="#FF4FA1" opacity="0.5" />

                        {/* Left Arm (Animated) */}
                        <g
                            style={{
                                transformOrigin: "754px 525px",
                                animation: isReducedMotion || isStaticRenderer
                                    ? "none"
                                    : "bmaLionLeftArm 0.8s ease-in-out infinite alternate",
                                animationPlayState: playState,
                            }}
                        >
                            <rect x="734" y="515" width="22" height="15" rx="7" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />
                        </g>

                        {/* Right Arm (Animated) */}
                        <g
                            style={{
                                transformOrigin: "806px 525px",
                                animation: isReducedMotion || isStaticRenderer
                                    ? "none"
                                    : "bmaLionRightArm 0.8s ease-in-out infinite alternate",
                                animationPlayState: playState,
                            }}
                        >
                            <rect x="804" y="515" width="22" height="15" rx="7" fill="#FFC04D" stroke={navyColor} strokeWidth="4" />
                        </g>
                    </g>

                    {/* Cow (x=890) */}
                    <g
                        className="bmaCow"
                        style={{
                            transformOrigin: "890px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaCowDance 1.7s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Legs */}
                        <rect x="874" y="580" width="12" height="40" rx="4" fill="#FFFFFF" stroke={navyColor} strokeWidth="3" />
                        <rect x="874" y="605" width="12" height="15" fill={navyColor} />
                        <rect x="904" y="580" width="12" height="40" rx="4" fill="#FFFFFF" stroke={navyColor} strokeWidth="3" />
                        <rect x="904" y="605" width="12" height="15" fill={navyColor} />

                        {/* Torso */}
                        <rect x="855" y="505" width="70" height="85" rx="20" fill="#FFFFFF" stroke={navyColor} strokeWidth="4" />
                        
                        {/* Cow Patches */}
                        <path d="M 857,525 Q 870,535 875,520 Q 880,510 865,507 Z" fill={navyColor} />
                        <path d="M 915,550 Q 900,560 905,575 Q 923,580 923,560 Z" fill={navyColor} />
                        <path d="M 870,560 Q 885,570 880,583 Q 865,580 865,565 Z" fill={navyColor} />

                        {/* Head */}
                        <ellipse cx="890" cy="480" rx="22" ry="18" fill="#FFFFFF" stroke={navyColor} strokeWidth="4" />
                        <path d="M 872,472 Q 882,482 888,470 Z" fill={navyColor} />
                        <circle cx="881" cy="476" r="2.5" fill={navyColor} />
                        <circle cx="899" cy="476" r="2.5" fill={navyColor} />
                        
                        {/* Pink Snout */}
                        <ellipse cx="890" cy="488" rx="16" ry="9" fill="#FFB2D6" stroke={navyColor} strokeWidth="3" />
                        <circle cx="884" cy="488" r="1.5" fill={navyColor} />
                        <circle cx="896" cy="488" r="1.5" fill={navyColor} />

                        {/* Horns & Ears */}
                        <path d="M 876,466 Q 870,454 876,458 Z" fill="#F3F4F6" stroke={navyColor} strokeWidth="2.5" />
                        <path d="M 904,466 Q 910,454 904,458 Z" fill="#F3F4F6" stroke={navyColor} strokeWidth="2.5" />
                        <path d="M 868,480 Q 856,478 864,486 Z" fill="#FFFFFF" stroke={navyColor} strokeWidth="2.5" />
                        <path d="M 912,480 Q 924,478 916,486 Z" fill="#FFFFFF" stroke={navyColor} strokeWidth="2.5" />
                    </g>

                    {/* Sheep (x=1000) */}
                    <g
                        className="bmaSheep"
                        style={{
                            transformOrigin: "1000px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaSheepDance 1.3s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Legs */}
                        <rect x="987" y="580" width="8" height="40" fill={navyColor} rx="3" />
                        <rect x="1005" y="580" width="8" height="40" fill={navyColor} rx="3" />

                        {/* Fluffy Body */}
                        <rect x="965" y="515" width="70" height="75" rx="30" fill="#FFFFFF" stroke={navyColor} strokeWidth="4" />
                        <circle cx="975" cy="525" r="14" fill="#FFFFFF" />
                        <circle cx="1025" cy="525" r="14" fill="#FFFFFF" />
                        <circle cx="990" cy="575" r="12" fill="#FFFFFF" />
                        <circle cx="1010" cy="575" r="12" fill="#FFFFFF" />
                        <circle cx="970" cy="550" r="12" fill="#FFFFFF" />
                        <circle cx="1030" cy="550" r="12" fill="#FFFFFF" />

                        {/* Head (Black) */}
                        <ellipse cx="1000" cy="492" rx="15" ry="15" fill={navyColor} />
                        <circle cx="993" cy="488" r="2" fill="#FFFFFF" />
                        <circle cx="1007" cy="488" r="2" fill="#FFFFFF" />

                        {/* Ears */}
                        <path d="M 985,492 Q 975,495 986,500 Z" fill={navyColor} />
                        <path d="M 1015,492 Q 1025,495 1014,500 Z" fill={navyColor} />

                        {/* Fluffy Crown */}
                        <circle cx="1000" cy="478" r="6" fill="#FFFFFF" />
                        <circle cx="994" cy="480" r="5" fill="#FFFFFF" />
                        <circle cx="1006" cy="480" r="5" fill="#FFFFFF" />
                    </g>

                    {/* Fox (x=1110) */}
                    <g
                        className="bmaFox"
                        style={{
                            transformOrigin: "1110px 620px",
                            animation: isReducedMotion || isStaticRenderer
                                ? "none"
                                : "bmaFoxDance 1.5s ease-in-out infinite",
                            animationPlayState: playState,
                        }}
                    >
                        {/* Tail */}
                        <path d="M 1130,560 Q 1160,565 1155,530" fill="none" stroke="#FF6E40" strokeWidth="18" strokeLinecap="round" />
                        <path d="M 1150,535 L 1157,522 L 1162,538 Z" fill="#FFFFFF" />

                        {/* Legs */}
                        <rect x="1098" y="580" width="8" height="40" rx="3" fill="#FF6E40" stroke={navyColor} strokeWidth="3" />
                        <rect x="1098" y="608" width="8" height="12" fill={navyColor} />
                        <rect x="1114" y="580" width="8" height="40" rx="3" fill="#FF6E40" stroke={navyColor} strokeWidth="3" />
                        <rect x="1114" y="608" width="8" height="12" fill={navyColor} />

                        {/* Torso */}
                        <rect x="1080" y="508" width="60" height="80" rx="22" fill="#FF6E40" stroke={navyColor} strokeWidth="4" />
                        <ellipse cx="1110" cy="552" rx="15" ry="24" fill="#FFFFFF" />

                        {/* Head */}
                        <circle cx="1110" cy="482" r="22" fill="#FF6E40" stroke={navyColor} strokeWidth="4" />
                        
                        {/* White Cheek Patches */}
                        <path d="M 1090,488 Q 1100,496 1110,492 Q 1104,478 1090,488 Z" fill="#FFFFFF" />
                        <path d="M 1130,488 Q 1120,496 1110,492 Q 1116,478 1130,488 Z" fill="#FFFFFF" />

                        {/* Eyes */}
                        <circle cx="1101" cy="480" r="2.5" fill={navyColor} />
                        <circle cx="1119" cy="480" r="2.5" fill={navyColor} />

                        {/* Nose */}
                        <circle cx="1110" cy="491" r="2.5" fill={navyColor} />

                        {/* Pointy Ears */}
                        <polygon points="1092,466 1102,450 1106,468" fill="#FF6E40" stroke={navyColor} strokeWidth="3" strokeLinejoin="round" />
                        <polygon points="1128,466 1118,450 1114,468" fill="#FF6E40" stroke={navyColor} strokeWidth="3" strokeLinejoin="round" />
                    </g>

                    {/* Paper Plane - Animates inside the SVG coordinate system */}
                    <g
                        style={{
                            transformOrigin: "100px 65px",
                            animation:
                                isReducedMotion || isStaticRenderer
                                    ? "none"
                                    : `bmaPlaneFly ${safeDuration}s cubic-bezier(0.2, 0.6, 0.3, 1) forwards`,
                            animationPlayState: scenePlayState,
                        }}
                    >
                        <g transform="translate(-100, -65)">
                            <polygon
                                points="12,66 188,14 118,66 188,116"
                                fill={whiteColor}
                            />
                            <polyline
                                points="118,66 76,90 12,66"
                                fill="none"
                                stroke={navyColor}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    </g>
                </svg>
            </div>

            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255, 255, 255, 0.3)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: showFinal ? 1 : 0,
                    animation:
                        isReducedMotion || isStaticRenderer
                            ? "none"
                            : `bmaFinalEnter ${safeDuration}s linear forwards`,
                    animationPlayState: finalPlayState,
                    pointerEvents: showFinal ? "auto" : "none",
                    transition: "opacity 0.6s ease-in-out",
                }}
            >
                <div
                    style={{
                        minWidth: "max-content",
                        textAlign: "center",
                        transform: "translateY(-2%)",
                        padding: "clamp(12px, 2vw, 24px)",
                        lineHeight: 1,
                    }}
                >
                    <div
                        style={{
                            fontFamily:
                                '"League Spartan", Montserrat, sans-serif',
                            fontSize: "clamp(18px, 3vw, 38px)",
                            letterSpacing: "0.16em",
                            fontWeight: 700,
                            color: accentColor,
                            marginBottom: "clamp(6px, 1.1vw, 14px)",
                        }}
                    >
                        {label.toUpperCase()}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "center",
                            gap: "clamp(8px, 1.2vw, 18px)",
                            flexWrap: "wrap",
                        }}
                    >
                        <span
                            style={{
                                fontFamily:
                                    '"League Spartan", Montserrat, sans-serif',
                                fontSize: "clamp(42px, 8vw, 120px)",
                                fontWeight: 800,
                                color: navyColor,
                                lineHeight: 0.9,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {age}
                            <sup style={{ fontSize: "0.55em", fontWeight: 800, marginLeft: "2px", textTransform: "lowercase" }}>th</sup>
                        </span>
                        <span
                            style={{
                                position: "relative",
                                display: "inline-block",
                                whiteSpace: "nowrap",
                                lineHeight: 0.86,
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    left: "0.055em",
                                    top: "0.065em",
                                    fontFamily:
                                        '"Brush Script MT", "Segoe Script", "Apple Chancery", "Lobster Two", "Lily Script One", cursive',
                                    fontSize: "clamp(72px, 15vw, 230px)",
                                    fontStyle: "italic",
                                    fontWeight: 700,
                                    color: accentColor,
                                    filter: "brightness(0.68) saturate(1.15)",
                                    textShadow:
                                        "0.01em 0.01em 0 rgba(0,0,0,0.02), 0.02em 0.02em 0 rgba(0,0,0,0.04), 0.03em 0.03em 0 rgba(0,0,0,0.06)",
                                    transform: "skewX(-6deg)",
                                    pointerEvents: "none",
                                    userSelect: "none",
                                }}
                                aria-hidden="true"
                            >
                                {messageWord}
                            </span>
                            <span
                                style={{
                                    position: "relative",
                                    fontFamily:
                                        '"Brush Script MT", "Segoe Script", "Apple Chancery", "Lobster Two", "Lily Script One", cursive',
                                    fontSize: "clamp(72px, 15vw, 230px)",
                                    fontStyle: "italic",
                                    fontWeight: 700,
                                    color: accentColor,
                                    textShadow:
                                        "0 0.01em 0 rgba(255,255,255,0.32), 0.012em 0.02em 0 rgba(255,255,255,0.22), 0.018em 0.03em 0 rgba(0,0,0,0.08)",
                                    transform: "skewX(-6deg)",
                                }}
                            >
                                {messageWord}
                            </span>
                        </span>
                    </div>
                    
                    {/* Navigate to Next Slide Arrow */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide(1);
                        }}
                        style={{
                            marginTop: "clamp(16px, 4vh, 48px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            cursor: "pointer",
                            pointerEvents: "auto",
                            animation: "bmaBounce 1.5s infinite",
                        }}
                    >
                        <span style={{
                            fontFamily: '"League Spartan", Montserrat, sans-serif',
                            fontSize: "clamp(12px, 1.6vw, 15px)",
                            fontWeight: 800,
                            letterSpacing: "0.12em",
                            color: navyColor,
                            textTransform: "uppercase",
                            marginBottom: "4px",
                        }}>
                            Scroll Down
                        </span>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={navyColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* End of Section 0 Wrapper */}
            </div>

            {/* Photo Slides — absolute overlays that slide in/out */}
            {showFinal && (
                <>
                    {/* Section 1: Miss */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "#FFA8D7",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            boxSizing: "border-box",
                            opacity: currentSlide === 1 ? 1 : 0,
                            pointerEvents: currentSlide === 1 ? "auto" : "none",
                            transition: "opacity 0.5s ease",
                            zIndex: 20,
                        }}
                    >
                        <div
                            style={{
                                background: "#FFFFFF",
                                padding: "clamp(12px, 2.5vw, 24px) clamp(12px, 2.5vw, 24px) clamp(24px, 5vw, 64px) clamp(12px, 2.5vw, 24px)",
                                borderRadius: "16px",
                                boxShadow: "0 20px 40px rgba(19, 41, 75, 0.15)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "90%",
                                maxWidth: "min(320px, 80vw)",
                                transform: "rotate(-2deg)",
                                transition: "all 0.4s ease",
                                cursor: "default",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.03) rotate(0deg)";
                                e.currentTarget.style.boxShadow = "0 30px 60px rgba(19, 41, 75, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "rotate(-2deg)";
                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(19, 41, 75, 0.15)";
                            }}
                        >
                            <div style={{
                                width: "100%",
                                aspectRatio: "3/4",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: `3px solid ${navyColor}`,
                                boxSizing: "border-box",
                            }}>
                                <img src="/miss.jpg" alt="Miss" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <h2 style={{
                                fontFamily: '"Lily Script One", "Lobster Two", cursive',
                                fontSize: "clamp(24px, 5vw, 38px)",
                                color: navyColor,
                                margin: "20px 0 0 0",
                                textAlign: "center",
                            }}>1. Miss</h2>
                        </div>
                        <div
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(2); }}
                            style={{
                                position: "absolute", bottom: "25px",
                                display: "flex", flexDirection: "column", alignItems: "center",
                                cursor: "pointer", animation: "bmaBounce 1.5s infinite",
                            }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={navyColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </div>

                    {/* Section 2: Gago */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "#FFBEE2",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            boxSizing: "border-box",
                            opacity: currentSlide === 2 ? 1 : 0,
                            pointerEvents: currentSlide === 2 ? "auto" : "none",
                            transition: "opacity 0.5s ease",
                            zIndex: 20,
                        }}
                    >
                        <div
                            style={{
                                background: "#FFFFFF",
                                padding: "clamp(12px, 2.5vw, 24px) clamp(12px, 2.5vw, 24px) clamp(24px, 5vw, 64px) clamp(12px, 2.5vw, 24px)",
                                borderRadius: "16px",
                                boxShadow: "0 20px 40px rgba(19, 41, 75, 0.15)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "90%",
                                maxWidth: "min(320px, 80vw)",
                                transform: "rotate(2.5deg)",
                                transition: "all 0.4s ease",
                                cursor: "default",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.03) rotate(0deg)";
                                e.currentTarget.style.boxShadow = "0 30px 60px rgba(19, 41, 75, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "rotate(2.5deg)";
                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(19, 41, 75, 0.15)";
                            }}
                        >
                            <div style={{
                                width: "100%",
                                aspectRatio: "3/4",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: `3px solid ${navyColor}`,
                                boxSizing: "border-box",
                            }}>
                                <img src="/gago.jpg" alt="Gago" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <h2 style={{
                                fontFamily: '"Lily Script One", "Lobster Two", cursive',
                                fontSize: "clamp(24px, 5vw, 38px)",
                                color: navyColor,
                                margin: "20px 0 0 0",
                                textAlign: "center",
                            }}>2. Gago</h2>
                        </div>
                        <div
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(3); }}
                            style={{
                                position: "absolute", bottom: "25px",
                                display: "flex", flexDirection: "column", alignItems: "center",
                                cursor: "pointer", animation: "bmaBounce 1.5s infinite",
                            }}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={navyColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>
                    </div>

                    {/* Section 3: Gupta */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "#FFD4ED",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                            boxSizing: "border-box",
                            opacity: currentSlide === 3 ? 1 : 0,
                            pointerEvents: currentSlide === 3 ? "auto" : "none",
                            transition: "opacity 0.5s ease",
                            zIndex: 20,
                        }}
                    >
                        <div
                            style={{
                                background: "#FFFFFF",
                                padding: "clamp(12px, 2.5vw, 24px) clamp(12px, 2.5vw, 24px) clamp(24px, 5vw, 64px) clamp(12px, 2.5vw, 24px)",
                                borderRadius: "16px",
                                boxShadow: "0 20px 40px rgba(19, 41, 75, 0.15)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "90%",
                                maxWidth: "min(320px, 80vw)",
                                transform: "rotate(-1.5deg)",
                                transition: "all 0.4s ease",
                                cursor: "default",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.03) rotate(0deg)";
                                e.currentTarget.style.boxShadow = "0 30px 60px rgba(19, 41, 75, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "rotate(-1.5deg)";
                                e.currentTarget.style.boxShadow = "0 20px 40px rgba(19, 41, 75, 0.15)";
                            }}
                        >
                            <div style={{
                                width: "100%",
                                aspectRatio: "3/4",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: `3px solid ${navyColor}`,
                                boxSizing: "border-box",
                            }}>
                                <img src="/gupta.jpg" alt="Gupta" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <h2 style={{
                                fontFamily: '"Lily Script One", "Lobster Two", cursive',
                                fontSize: "clamp(24px, 5vw, 38px)",
                                color: navyColor,
                                margin: "20px 0 0 0",
                                textAlign: "center",
                            }}>3. Gupta</h2>
                        </div>
                        <div
                            onClick={(e) => { e.stopPropagation(); setCurrentSlide(0); }}
                            style={{
                                position: "absolute", bottom: "25px",
                                display: "flex", flexDirection: "column", alignItems: "center",
                                cursor: "pointer", animation: "bmaBounce 1.5s infinite",
                            }}
                        >
                            <span style={{
                                fontFamily: '"League Spartan", Montserrat, sans-serif',
                                fontSize: "12px", fontWeight: 800,
                                color: navyColor, textTransform: "uppercase", marginBottom: "4px",
                            }}>Back to Top</span>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={navyColor} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15" />
                            </svg>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

addPropertyControls(BirthdayMailboxAnimation, {
    messageWord: {
        type: ControlType.String,
        title: "Word",
        defaultValue: "birthday",
    },
    label: {
        type: ControlType.String,
        title: "Label",
        defaultValue: "HAPPY",
    },
    age: {
        type: ControlType.String,
        title: "Age",
        defaultValue: "24",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FF8CCB",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#FF4FA1",
    },
    navyColor: {
        type: ControlType.Color,
        title: "Navy",
        defaultValue: "#13294B",
    },
    blueColor: {
        type: ControlType.Color,
        title: "Blue",
        defaultValue: "#89BFFF",
    },
    whiteColor: {
        type: ControlType.Color,
        title: "White",
        defaultValue: "#FFFFFF",
    },
    durationSeconds: {
        type: ControlType.Number,
        title: "Duration",
        defaultValue: 6,
        min: 2,
        max: 20,
        step: 0.5,
        unit: "s",
    },
    autoReplay: {
        type: ControlType.Boolean,
        title: "Auto Replay",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    replayOnClick: {
        type: ControlType.Boolean,
        title: "Click Replay",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
})
