import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import ValueProps from './components/ValueProps.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import GameLibrary from './components/GameLibrary.jsx'
import Celebrate from './components/Celebrate.jsx'
import Quote from './components/Quote.jsx'
import FinalCta from './components/FinalCta.jsx'
import Footer from './components/Footer.jsx'
import RouletteGame from './games/roulette/RouletteGame.tsx'
import WouldYouRatherGame from './games/would-you-rather/WouldYouRatherGame.tsx'
import JeopardyGame from './games/jeopardy/JeopardyGame.tsx'
import BingoGame from './games/bingo/BingoGame.tsx'
import TwoTruthsGame from './games/two-truths/TwoTruthsGame.tsx'
import ScavengerHuntGame from './games/scavenger-hunt/ScavengerHuntGame.tsx'
import ComingSoonGame from './games/shared/ComingSoonGame.tsx'
import SuggestGamePage from './games/shared/SuggestGamePage.tsx'
import SupportPage from './components/SupportPage.jsx'
import AuthPage from './auth/AuthPage.tsx'
import { GAME_CATALOG } from './games/shared/gameCatalog.ts'

function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <ValueProps />
      <GameLibrary />
      <HowItWorks />
      <Celebrate />
      <Quote />
      <FinalCta />
      <Footer />
    </>
  )
}

/**
 * /:gameId — built games render their module, catalog games without a module yet
 * render the Coming Soon page, and unknown ids bounce back to the landing page.
 */
function GamePage() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const exitToLibrary = () => navigate('/')

  if (gameId === 'roulette') {
    return <RouletteGame onExit={exitToLibrary} />
  }
  if (gameId === 'would-you-rather') {
    return <WouldYouRatherGame onExit={exitToLibrary} />
  }
  if (gameId === 'jeopardy') {
    return <JeopardyGame onExit={exitToLibrary} />
  }
  if (gameId === 'bingo') {
    return <BingoGame onExit={exitToLibrary} />
  }
  if (gameId === 'two-truths-and-a-lie') {
    return <TwoTruthsGame onExit={exitToLibrary} />
  }
  if (gameId === 'scavenger-hunt') {
    return <ScavengerHuntGame onExit={exitToLibrary} />
  }

  const entry = GAME_CATALOG.find((g) => g.id === gameId)
  if (entry) {
    return <ComingSoonGame emoji={entry.emoji} title={entry.title} tagline={entry.tagline} onBack={exitToLibrary} />
  }

  return <Navigate to="/" replace />
}

/** Route changes land at the top of the new page instead of the old scroll offset. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const navigate = useNavigate()
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/suggest-a-game" element={<SuggestGamePage onBack={() => navigate('/')} />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/:gameId" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
