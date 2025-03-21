import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeProps {
  selectedLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
}

const latLongToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  console.log('Coordinate Mapping:');
  console.log('Input:', { lat, lon });
  console.log('Radians:', { phi, theta });
  console.log('Position:', { x, y, z });

  return new THREE.Vector3(x, y, z);
};

export const Globe: React.FC<GlobeProps> = ({ selectedLocation }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const markerRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (selectedLocation && markerRef.current) {
      const point = latLongToVector3(selectedLocation.lat, selectedLocation.lon, 1.01);
      markerRef.current.position.copy(point);

      markerRef.current.lookAt(new THREE.Vector3(0, 0, 0));
      markerRef.current.rotateX(Math.PI / 2);

      const targetPosition = point.clone().multiplyScalar(3);
      const duration = 1000;
      const startPosition = camera.position.clone();
      const startTime = Date.now();

      function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const t = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;

        camera.position.lerpVectors(startPosition, targetPosition, t);
        camera.lookAt(point);

        if (progress < 1) requestAnimationFrame(animateCamera);
      }

      animateCamera();
    }
  }, [selectedLocation, camera]);

  useFrame(() => {
    if (globeRef.current && !selectedLocation) {
      globeRef.current.rotation.y += 0.001;
    }
    if (glowRef.current && globeRef.current) {
      glowRef.current.rotation.copy(globeRef.current.rotation);
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <pointLight position={[-5, -3, -5]} intensity={0.8} />

      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg')}
          bumpMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg')}
          bumpScale={0.05}
          specularMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg')}
          specular={new THREE.Color(0x999999)}
          shininess={15}
        />
      </Sphere>

      <Sphere ref={glowRef} args={[1.1, 32, 32]}>
        <meshPhongMaterial color={0x0066ff} transparent opacity={0.15} side={THREE.BackSide} />
      </Sphere>

      {selectedLocation && (
        <group ref={markerRef}>
          <mesh>
            <coneGeometry args={[0.02, 0.06, 8]} />
            <meshPhongMaterial color={0xff3333} emissive={0xff0000} emissiveIntensity={0.8} transparent opacity={0.9} />
          </mesh>
          <pointLight color={0xff0000} intensity={0.8} distance={0.25} decay={2} />
        </group>
      )}
    </>
  );
};
