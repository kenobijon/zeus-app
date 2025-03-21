import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

interface CloudModelProps {
  position: [number, number, number];
  scale?: number;
  rotation?: [number, number, number];
  onHover?: () => void;
  onUnhover?: () => void;
}

const noise3D = createNoise3D();

const CloudModel: React.FC<CloudModelProps> = ({ position, scale = 1, rotation = [0, 0, 0], onHover, onUnhover }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const glowMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color(0xffffff),
    emissive: new THREE.Color(0x4a9eff),
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.8,
    shininess: 50,
  });

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    const time = clock.getElapsedTime();
    
    const noiseOffset = noise3D(
      position[0] * 0.1,
      position[1] * 0.1,
      time * 0.1
    ) * 0.02;
    
    groupRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05 + noiseOffset;
    
    const targetGlow = hovered ? 1 : 0;
    const newGlowIntensity = THREE.MathUtils.lerp(glowIntensity, targetGlow, 0.1);
    setGlowIntensity(newGlowIntensity);

    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshPhongMaterial;
        material.emissiveIntensity = newGlowIntensity;
        material.color.lerp(new THREE.Color(0x4a9eff), newGlowIntensity * 0.3);
      }
    });
  });

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(true);
    if (onHover) onHover();
  }, [onHover]);

  const handlePointerOut = useCallback((e: any) => {
    e.stopPropagation();
    setHovered(false);
    if (onUnhover) onUnhover();
  }, [onUnhover]);

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      scale={[scale, scale, scale]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhongMaterial {...glowMaterial} />
      </mesh>
      
      {[
        [0.4, 0.1, 0],
        [-0.4, 0.1, 0],
        [0, 0.2, 0],
        [0.2, -0.1, 0.2],
        [-0.2, -0.1, -0.2]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.3 + Math.random() * 0.1, 32, 32]} />
          <meshPhongMaterial {...glowMaterial} />
        </mesh>
      ))}

      <mesh scale={1.2}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={0x4a9eff}
          transparent
          opacity={glowIntensity * 0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const LightningBolt: React.FC<{ startPosition: [number, number, number] }> = ({ startPosition }) => {
  const boltRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(1);
  
  useFrame(() => {
    setOpacity((prev) => Math.max(0, prev - 0.1));
  });

  const createBranch = (start: THREE.Vector3, direction: THREE.Vector3, length: number): THREE.Vector3[] => {
    const points = [start];
    let currentPoint = start.clone();
    
    const segments = Math.floor(length * 10);
    for (let i = 0; i < segments; i++) {
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        -length / segments + (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.4
      );
      currentPoint = currentPoint.clone().add(offset);
      points.push(currentPoint);
    }
    
    return points;
  };

  const { mainBolt, branches } = React.useMemo(() => {
    const start = new THREE.Vector3(...startPosition);
    const mainPoints = createBranch(start, new THREE.Vector3(0, -1, 0), 4);
    
    const branchData = [];
    const branchCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < branchCount; i++) {
      const branchStart = mainPoints[Math.floor(Math.random() * (mainPoints.length - 1))].clone();
      const branchDir = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        -1,
        (Math.random() - 0.5) * 2
      ).normalize();
      branchData.push(createBranch(branchStart, branchDir, 1 + Math.random()));
    }
    
    return { mainBolt: mainPoints, branches: branchData };
  }, [startPosition]);

  if (opacity <= 0) return null;

  return (
    <group ref={boltRef}>
      <group>
        <mesh>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(mainBolt), 20, 0.05, 8, false]} />
          <meshBasicMaterial color={0xffffff} transparent opacity={opacity} />
        </mesh>
        <mesh>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(mainBolt), 20, 0.1, 8, false]} />
          <meshBasicMaterial
            color={0x4a9eff}
            transparent
            opacity={opacity * 0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh>
          <tubeGeometry args={[new THREE.CatmullRomCurve3(mainBolt), 20, 0.2, 8, false]} />
          <meshBasicMaterial
            color={0x4a9eff}
            transparent
            opacity={opacity * 0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {branches.map((branch, i) => (
        <group key={i}>
          <mesh>
            <tubeGeometry args={[new THREE.CatmullRomCurve3(branch), 20, 0.03, 8, false]} />
            <meshBasicMaterial color={0xffffff} transparent opacity={opacity * 0.9} />
          </mesh>
          <mesh>
            <tubeGeometry args={[new THREE.CatmullRomCurve3(branch), 20, 0.06, 8, false]} />
            <meshBasicMaterial
              color={0x4a9eff}
              transparent
              opacity={opacity * 0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh>
            <tubeGeometry args={[new THREE.CatmullRomCurve3(branch), 20, 0.12, 8, false]} />
            <meshBasicMaterial
              color={0x4a9eff}
              transparent
              opacity={opacity * 0.3}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const WeatherSystem: React.FC = () => {
  const [lightnings, setLightnings] = useState<Array<{ id: number; position: [number, number, number] }>>([]);
  
  const createLightning = useCallback((position: [number, number, number]) => {
    const id = Date.now();
    setLightnings(prev => [...prev, { id, position }]);
    setTimeout(() => {
      setLightnings(prev => prev.filter(l => l.id !== id));
    }, 500);
  }, []);

  // Add random lightning effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.6) { // 60% chance of lightning (increased from 30%)
        const randomCloud = clouds[Math.floor(Math.random() * clouds.length)];
        createLightning([
          randomCloud.position[0],
          randomCloud.position[1] - 0.5,
          randomCloud.position[2]
        ]);
      }
    }, 800); // Check every 800ms (reduced from 2000ms)

    return () => clearInterval(interval);
  }, [createLightning]);

  const clouds = React.useMemo(() => {
    const cloudData = [];
    for (let i = 0; i < 50; i++) {
      cloudData.push({
        position: [
          (Math.random() - 0.5) * 30,
          Math.random() * 20 - 5,
          (Math.random() - 0.5) * 30
        ] as [number, number, number],
        scale: 0.3 + Math.random() * 0.7,
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ] as [number, number, number]
      });
    }
    return cloudData;
  }, []);

  return (
    <group>
      {clouds.map((cloud, i) => (
        <CloudModel
          key={i}
          position={cloud.position}
          scale={cloud.scale}
          rotation={cloud.rotation}
        />
      ))}
      {lightnings.map(lightning => (
        <LightningBolt key={lightning.id} startPosition={lightning.position} />
      ))}
    </group>
  );
};

export const WeatherEffects: React.FC = () => {
  return (
    <div className="fixed inset-0">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <fog attach="fog" args={['#1e293b', 5, 30]} />
        <WeatherSystem />
        <EffectComposer>
          <Bloom
            intensity={2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};