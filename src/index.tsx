import { createRoot } from "react-dom/client";
import "./styles.css";
import { Canvas } from "@react-three/fiber";
import { Color } from "three";
import { BoxButton } from "./components/box-button";
import { Box, Flex } from "@react-three/flex";
import {
  ProjectContextProvider,
  useProjectContext,
  useProjectState
} from "./context";
import { Telemetry } from "./components/telemetry";
import { useEffect } from "react";

function Vehicles() {
  const {
    state: { vehicles },
    updateState
  } = useProjectContext();
  return (
    <group position={[-2, 0.5, 0]} rotation-y={0.2}>
      <Flex size={[2, 10, 0]} position={[-3 / 2, 5 / 2, 0]}>
        <Box width={2} height={10} dir="row" justify="flex-start" wrap="wrap">
          {vehicles &&
            vehicles.map(({ name, id, color }) => (
              <BoxButton
                key={id}
                size={[0.9, 0.25, 0.02]}
                label={name}
                color={color}
                onHandler={() => updateState({ targetVehicleId: id })}
              />
            ))}
        </Box>
      </Flex>
    </group>
  );
}

function App() {
  const contextValue = useProjectState();
  const { updateState } = contextValue;
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await fetch(
          "https://vehicle-api-test.herokuapp.com/api/vehicles"
        );
        const data = await response.json();
        if (mounted) updateState({ vehicles: data });
      } catch (e) {
        console.log(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [updateState]);
  return (
    <Canvas
      onCreated={({ scene }) => {
        scene.background = new Color(0x000000);
      }}
    >
      <ProjectContextProvider value={contextValue}>
        <Vehicles />
        <Telemetry />
      </ProjectContextProvider>
    </Canvas>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
