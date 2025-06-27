import { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DiceFaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  value: number;
}

function DiceFace({ position, rotation, value }: DiceFaceProps) {
  // Create dots pattern for each face
  const getDots = (faceValue: number) => {
    const dotPositions: [number, number, number][] = [];
    const offset = 0.15;
    
    switch (faceValue) {
      case 1:
        dotPositions.push([0, 0, 0.001]);
        break;
      case 2:
        dotPositions.push([-offset, offset, 0.001]);
        dotPositions.push([offset, -offset, 0.001]);
        break;
      case 3:
        dotPositions.push([-offset, offset, 0.001]);
        dotPositions.push([0, 0, 0.001]);
        dotPositions.push([offset, -offset, 0.001]);
        break;
      case 4:
        dotPositions.push([-offset, offset, 0.001]);
        dotPositions.push([offset, offset, 0.001]);
        dotPositions.push([-offset, -offset, 0.001]);
        dotPositions.push([offset, -offset, 0.001]);
        break;
      case 5:
        dotPositions.push([-offset, offset, 0.001]);
        dotPositions.push([offset, offset, 0.001]);
        dotPositions.push([0, 0, 0.001]);
        dotPositions.push([-offset, -offset, 0.001]);
        dotPositions.push([offset, -offset, 0.001]);
        break;
      case 6:
        dotPositions.push([-offset, offset, 0.001]);
        dotPositions.push([offset, offset, 0.001]);
        dotPositions.push([-offset, 0, 0.001]);
        dotPositions.push([offset, 0, 0.001]);
        dotPositions.push([-offset, -offset, 0.001]);
        dotPositions.push([offset, -offset, 0.001]);
        break;
    }
    
    return dotPositions;
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Face - always white */}
      <mesh>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Dots - black dots */}
      {getDots(value).map((dotPos, index) => (
        <mesh key={index} position={dotPos}>
          <circleGeometry args={[0.08, 8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  );
}

interface ThreeDDiceProps {
  isRolling: boolean;
  finalValue: number | null;
  onAnimationComplete?: () => void;
}

function DiceMesh({ isRolling, finalValue, onAnimationComplete }: ThreeDDiceProps) {
  const meshRef = useRef<THREE.Group>(null);
  const animationRef = useRef({ 
    isAnimating: false,
    velocity: { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0 },
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    bounceCount: 0
  });
  
  const gravity = -0.025;
  const damping = 0.6;
  const rotationDamping = 0.95;

  // Memoized final rotation calculation
  const getFinalRotation = useCallback((value: number) => {
    const faceRotations = {
      1: [0, 0, 0],
      2: [0, -Math.PI / 2, 0],
      3: [-Math.PI / 2, 0, 0],
      4: [Math.PI / 2, 0, 0],
      5: [0, Math.PI / 2, 0],
      6: [0, Math.PI, 0],
    };
    const diceValue = Math.min(6, Math.max(1, Math.floor((value - 1) / 16.66) + 1));
    return faceRotations[diceValue as keyof typeof faceRotations];
  }, []);

  useEffect(() => {
    if (isRolling && !animationRef.current.isAnimating) {
      // Reset animation state
      animationRef.current.isAnimating = true;
      animationRef.current.bounceCount = 0;
      animationRef.current.position = { x: 0, y: 1.2, z: 0 };
      animationRef.current.velocity = {
        x: (Math.random() - 0.5) * 0.03,
        y: -0.03,
        z: (Math.random() - 0.5) * 0.03,
        rotX: (Math.random() - 0.5) * 0.2,
        rotY: (Math.random() - 0.5) * 0.2,
        rotZ: (Math.random() - 0.5) * 0.2,
      };
      animationRef.current.rotation = { x: 0, y: 0, z: 0 };
    }
  }, [isRolling]);

  useFrame(() => {
    if (!meshRef.current || !animationRef.current.isAnimating) return;

    const anim = animationRef.current;
    
    // Apply gravity
    anim.velocity.y += gravity;

    // Update position
    anim.position.x += anim.velocity.x;
    anim.position.y += anim.velocity.y;
    anim.position.z += anim.velocity.z;

    // Keep dice in bounds
    anim.position.x = Math.max(-0.8, Math.min(0.8, anim.position.x));
    anim.position.z = Math.max(-0.8, Math.min(0.8, anim.position.z));

    // Update rotation
    anim.rotation.x += anim.velocity.rotX;
    anim.rotation.y += anim.velocity.rotY;
    anim.rotation.z += anim.velocity.rotZ;

    // Ground collision
    if (anim.position.y <= 0 && anim.velocity.y < 0) {
      anim.position.y = 0;
      anim.velocity.y = -anim.velocity.y * damping;
      anim.velocity.x *= damping;
      anim.velocity.z *= damping;
      anim.bounceCount++;
      
      // Random bounce rotation
      anim.velocity.rotX += (Math.random() - 0.5) * 0.1;
      anim.velocity.rotY += (Math.random() - 0.5) * 0.1;
      anim.velocity.rotZ += (Math.random() - 0.5) * 0.1;
    }

    // Apply rotation damping
    anim.velocity.rotX *= rotationDamping;
    anim.velocity.rotY *= rotationDamping;
    anim.velocity.rotZ *= rotationDamping;

    // Stop animation when settled
    if (
      Math.abs(anim.velocity.y) < 0.008 &&
      Math.abs(anim.velocity.x) < 0.008 &&
      Math.abs(anim.velocity.z) < 0.008 &&
      anim.bounceCount > 1
    ) {
      anim.isAnimating = false;
      anim.position.y = 0;
      
      // Set final rotation
      if (finalValue !== null) {
        const finalRot = getFinalRotation(finalValue);
        anim.rotation.x = finalRot[0];
        anim.rotation.y = finalRot[1];
        anim.rotation.z = finalRot[2];
        
        // Call completion callback after a short delay
        setTimeout(() => onAnimationComplete?.(), 300);
      }
    }

    // Apply transforms to mesh
    meshRef.current.position.set(anim.position.x, anim.position.y, anim.position.z);
    meshRef.current.rotation.set(anim.rotation.x, anim.rotation.y, anim.rotation.z);
  });

  return (
    <group ref={meshRef}>
      {/* Dice faces */}
      <DiceFace position={[0, 0, 0.5]} rotation={[0, 0, 0]} value={1} />
      <DiceFace position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} value={2} />
      <DiceFace position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} value={3} />
      <DiceFace position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]} value={4} />
      <DiceFace position={[-0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} value={5} />
      <DiceFace position={[0, 0, -0.5]} rotation={[0, Math.PI, 0]} value={6} />
    </group>
  );
}

export function ThreeDDice({ isRolling, finalValue, onAnimationComplete }: ThreeDDiceProps) {
  return (
    <div className="w-32 h-32 mx-auto">
      <Canvas 
        camera={{ position: [0, 1.5, 2.5], fov: 50 }}
        dpr={[1, 1.5]} // Limit pixel ratio for performance
        performance={{ min: 0.5 }} // Performance optimization
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 3, 3]} intensity={0.8} />
        <DiceMesh
          isRolling={isRolling}
          finalValue={finalValue}
          onAnimationComplete={onAnimationComplete}
        />
      </Canvas>
    </div>
  );
}
