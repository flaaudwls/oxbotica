import React, { useMemo, useState } from "react";
import { extend, MeshProps } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { ColorRepresentation } from "three";
import { RoundGeometry } from "./round-geometry";
import { Box, FlexProps } from "@react-three/flex";
extend({ RoundGeometry });

interface Props extends MeshProps {
  width?: number;
  height?: number;
  borderRadius?: number | number[];
  color?: ColorRepresentation;
  opacity?: number;
}

export const BoxHelper: React.FC<Props> = ({
  width = 1,
  height = 1,
  borderRadius = 0,
  color = "white",
  opacity = 1,
  ...rest
}) => {
  return (
    <mesh position={[width / 2, -height / 2, 0.001]} {...rest}>
      <roundGeometry args={[width, height, borderRadius]} />
      <meshBasicMaterial color={color} opacity={opacity} transparent={true} />
    </mesh>
  );
};

interface ButtonProps extends FlexProps {
  label: string;
  size: [number, number, number];
  color: string;
  fontSize?: number;
  fontColor?: string;
  layer?: number;
  onHandler: () => void;
}

export const BoxButton: React.FC<ButtonProps> = ({
  label,
  size,
  color,
  onHandler,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setSelected] = useState(false);

  const { opacity, scale } = useMemo(() => {
    if (isHovered && !isSelected) return { opacity: 0.7, scale: 1.04 };
    if (isHovered && isSelected) return { opacity: 1, scale: 1 };
    return { opacity: 1, scale: 1 };
  }, [isHovered, isSelected]);

  return (
    <Box
      width={size[0]}
      height={size[1]}
      justify="center"
      align={"center"}
      margin={0.03}
      {...rest}
    >
      <mesh
        position={[size[0] / 2, -size[1] / 2, 0.001]}
        scale={scale}
        onClick={onHandler}
        onPointerOver={() => setIsHovered(true)}
        onPointerDown={() => setSelected(true)}
        onPointerUp={(e) => setSelected(false)}
        onPointerLeave={() => {
          setIsHovered(false);
          setSelected(false);
        }}
      >
        <roundGeometry args={[size[0], size[1], size[2]]} />
        <meshBasicMaterial color={color} opacity={opacity} transparent={true} />
      </mesh>

      <Box centerAnchor>
        <Text
          position-z={0.02}
          textAlign={"left"}
          fontSize={0.1}
          color={invertColor(color)}
        >
          {label}
        </Text>
      </Box>
    </Box>
  );
};

function invertColor(hex: any) {
  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 140 ? "#000000" : "#FFFFFF";
}
