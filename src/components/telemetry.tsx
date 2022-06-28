import { Text } from "@react-three/drei";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, TextureLoader, Vector2, Vector3 } from "three";
import { useProjectContext } from "../context";
import { RoundGeometry } from "./round-geometry";

// @ts-ignore
import glsl from "glslify";
extend({ RoundGeometry });

function Battery({ value = 0 }: { value?: number }) {
  return (
    <group position={[0.15, -0.8, 0]}>
      <mesh>
        <roundGeometry args={[1.9, 0.2, 0.1]} />
        <shaderMaterial
          args={[
            {
              uniforms: { x: { value: value / 100.0 } },
              vertexShader: glsl`
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
              fragmentShader: glsl`
            #ifdef GL_ES
            precision mediump float;
            #endif
            
            varying vec2 vUv;
            uniform float x;
            
            void main(){
                float y = step(x, vUv.x);
                vec3 color = (1. - y) * vec3(0.0471, 0.5294, 0.9804) + y * vec3(0.6);
                gl_FragColor = vec4(color, 1.0);
            }
        `
            }
          ]}
        />
      </mesh>
      <Text textAlign="left" fontSize={0.15} color={"black"} position-z={0.02}>
        {`Battery: ${value}%`}
      </Text>
    </group>
  );
}

function CPU({ value = 0 }: { value?: number }) {
  return (
    <group position={[0.15, -2, 0]}>
      <mesh>
        <planeGeometry args={[2, 2]} />
        <shaderMaterial
          args={[
            {
              uniforms: {
                x: { value: (value / 100.0) * 2 * Math.PI },
                u_resolution: { value: new Vector2(200, 200) }
              },
              vertexShader: glsl`
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
      `,
              fragmentShader: glsl`
                #define PI 3.1415926535897932384626433832795
                varying vec2 vUv;
                uniform float x;
                uniform vec2 u_resolution;
                            
                const vec4 Green = vec4(0,1,0,1);
                const vec4 Gray = vec4(0.5,0.5,0.5,1);

                float intersect(float d1, float d2)
                {
                    return max(d1, d2);
                }

                float merge(float d1, float d2)
                {
                    return min(d1, d2);
                }

                float pie(vec2 p, float angle)
                {
                    vec2 n = vec2(-cos(angle), sin(angle));
                    return p.x * n.x + p.y*n.y;
                }

                float sceneDist(vec2 p, inout vec4 color, float angle)
                {    
                    vec2 center = u_resolution.xy / 2.0;
                    p = p - center;    
                    float cc = 0.0;
                    float start = 0.0;
                    float circle = length(p) - center.y * 0.9;    
                    
                    for(int i = 0; i < 2; i++)
                    {
                        float end;
                        vec4 pieColor;        
                        if(i == 1)
                        {
                            end = 2.0 * PI;
                            pieColor = Gray;
                        }
                        else
                        {
                            end = start + angle;
                            pieColor = Green;
                        }                
                        
                        float c = pie(p, start);    
                        float c2 = pie(p, end);    
                        float delta = end - start;
                        if(delta < PI)
                            cc = intersect(c,1.0 - c2);
                        else
                            cc = merge(c,1.0 - c2);
                        cc = intersect(circle, cc);
                        color = mix(color, pieColor, clamp(1.0-cc, 0.0, 1.0) );
                        start = end;
                    }    
                    return cc;
                }


                void main(){
                vec2 fragCoord = vUv * u_resolution;
                vec2 p = fragCoord.xy + vec2(0.5);
                // background	
                vec4 col = vec4(0., 0., 0., 1.0);
                float dist = sceneDist(p, col, x);
                gl_FragColor = clamp(col, 0., 1.0);
                }
      `
            }
          ]}
        />
      </mesh>
      <Text textAlign="left" fontSize={0.2} color={"blue"} position-z={0.02}>
        {`CPU: ${value}%`}
      </Text>
    </group>
  );
}

function LatLng({ lat = 0, lng = 0 }: any) {
  const map = useLoader(TextureLoader, "./map.jpg");
  const globe = useRef<Group>(null!);
  useFrame((_, delta) => {
    if (!globe.current) return;
    globe.current.rotation.y += delta;
  });

  const pos = useMemo(() => {
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lng + 180) * (Math.PI / 180);

    const x = -(1 * Math.sin(phi) * Math.cos(theta));
    const z = 1 * Math.sin(phi) * Math.sin(theta);
    const y = 1 * Math.cos(phi);

    return new Vector3(x, y, z);
  }, [lat, lng]);

  return (
    <group position={[0, 0.5, 0.5]}>
      <Text
        textAlign="left"
        fontSize={0.2}
        color={"white"}
        position={[0, 1.25, 0]}
      >
        {`Lat: ${lat.toFixed(0)},  Lng: ${lng.toFixed(0)}`}
      </Text>
      <group ref={globe} rotation-x={0.3}>
        <mesh>
          <sphereGeometry args={[1, 18, 18]} />
          <meshBasicMaterial map={map} transparent={true} opacity={0.6} />
        </mesh>
        <mesh position={pos}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color={"red"} />
        </mesh>
      </group>
    </group>
  );
}

export const Telemetry = () => {
  const {
    state: { vehicles, targetVehicleId }
  } = useProjectContext();
  const [telemetryInfo, setTelemetryInfo] = useState({
    vehicle_id: "3b12792d-7c09-4669-a47d-e8c2e6d5a590",
    timestamp: 1656421233000,
    lat: 51.757879487984894,
    lng: -1.2635564804077146,
    speed: 29.2,
    cpu_usage: 56.5,
    battery_level: 72.7
  });

  useEffect(() => {
    if (!targetVehicleId) return;
    let mounted = true;
    (async () => {
      try {
        const response = await fetch(
          `https://vehicle-api-test.herokuapp.com/api/vehicles/${targetVehicleId}/telemetry`
        );
        const data = await response.json();
        if (mounted) setTelemetryInfo(data);
      } catch (e) {
        console.log(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [targetVehicleId]);

  const vehicleName = useMemo(() => {
    if (!targetVehicleId) return null;
    const { name } = vehicles.find((_) => _.id === targetVehicleId)!;
    return name;
  }, [vehicles, targetVehicleId]);

  const { cpu_usage, battery_level, lat, lng } = telemetryInfo;

  return (
    <group position={[0, 0.5, 0]} scale={targetVehicleId ? 1 : 1e-5}>
      <Text textAlign="left" fontSize={0.22} color={"green"} position-y={2.4}>
        {targetVehicleId ? `${vehicleName}` : ""}
      </Text>
      <Battery value={battery_level} />
      <CPU value={cpu_usage} />
      <LatLng lat={lat} lng={lng} />
    </group>
  );
};
