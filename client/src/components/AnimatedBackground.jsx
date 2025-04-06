import { styled, keyframes } from '@mui/material/styles';
import Particles from './Particles';

const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg) scale(1); }
  50% { transform: translateY(-20px) rotate(2deg) scale(1.05); }
  100% { transform: translateY(0px) rotate(0deg) scale(1); }
`;

const sentimentGlow = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 0.6; }
  100% { opacity: 0.4; }
`;

const Background = styled('div')`
  position: fixed;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 0;
  background: linear-gradient(
    150deg,
    #f0f4f8 0%,
    #f8f9fa 50%,
    #e9ecef 100%
  );
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(59, 130, 246, 0.05) 0%,
      transparent 70%
    );
    animation: ${sentimentGlow} 8s ease-in-out infinite;
  }
`;

const SentimentShapes = styled('div')`
  position: absolute;
  width: 100%;
  height: 100%;
  
  div {
    position: absolute;
    border-radius: 50%;
    animation: ${float} 25s ease-in-out infinite;
    backdrop-filter: blur(2px);
    border: 1px solid rgba(255,255,255,0.1);
    opacity: 0.8;
    mix-blend-mode: soft-light;
    
    &:nth-child(1) {
      width: 220px;
      height: 220px;
      top: 15%;
      left: 15%;
      background: rgba(16, 185, 129, 0.08);
      animation-duration: 20s;
    }
    
    &:nth-child(2) {
      width: 180px;
      height: 180px;
      top: 65%;
      left: 70%;
      background: rgba(245, 158, 11, 0.08);
      animation-duration: 22s;
    }
    
    &:nth-child(3) {
      width: 280px;
      height: 280px;
      top: 30%;
      left: 60%;
      background: rgba(59, 130, 246, 0.1);
      animation-duration: 18s;
    }
  }
`;

// Add new fluid animation
const fluidMovement = keyframes`
  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
`;

// Add new component
const FluidBlob = styled('div')`
  position: absolute;
  width: 400px;
  height: 400px;
  background: rgba(239, 68, 68, 0.05);
  animation: ${fluidMovement} 20s infinite;
  filter: blur(60px);
  mix-blend-mode: screen;
  opacity: 0.4;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
`;

export default function AnimatedBackground() {
  return (
    <Background>
      <Particles />
      <SentimentShapes>
        <div />
        <div />
        <div />
      </SentimentShapes>
      <FluidBlob />
    </Background>
  );
} 