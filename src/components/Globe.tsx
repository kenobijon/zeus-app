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

const createEarthGeometry = () => {
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const positions = geometry.attributes.position.array;
  const uvs = geometry.attributes.uv.array;

  // Adjust UV mapping to match Earth texture orientation
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Convert position to spherical coordinates
    const phi = Math.atan2(z, x);
    const theta = Math.acos(y);
    
    // Map to UV coordinates
    // Note: We invert the V coordinate (1 - v) to flip the texture right-side up
    uvs[i/3 * 2] = (phi + Math.PI) / (2 * Math.PI);
    uvs[i/3 * 2 + 1] = 1 - (theta / Math.PI);
  }

  geometry.attributes.uv.needsUpdate = true;
  return geometry;
};

const latLongToVector3 = (lat: number, lon: number, radius: number): THREE.Vector3 => {
  // Convert lat/lon to radians
  const latRad = lat * (Math.PI / 180);
  const lonRad = lon * (Math.PI / 180);

  // Convert to 3D coordinates
  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  console.log('Coordinate Mapping:');
  console.log('Input:', { lat, lon });
  console.log('Radians:', { latRad, lonRad });
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

      // Fix marker orientation to point outward from the globe
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

      <mesh ref={globeRef} geometry={createEarthGeometry()}>
        <meshPhongMaterial
          map={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg')}
          bumpMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg')}
          bumpScale={0.05}
          specularMap={new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg')}
          specular={new THREE.Color(0x999999)}
          shininess={15}
        />
      </mesh>

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
