import { Object3DNode } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  PlaneGeometry,
  Shape,
  ShapeBufferGeometry,
  Vector3
} from "three";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      roundGeometry: Object3DNode<RoundGeometry, typeof RoundGeometry>;
    }
  }
}

export class RoundGeometry extends BufferGeometry {
  constructor(
    width: number = 1,
    height: number = 1,
    borderRadius: number | number[] = 0
  ) {
    super();
    let radius = [0, 0];
    if (!Array.isArray(borderRadius)) {
      radius = Array(2).fill(borderRadius);
    } else {
      radius = borderRadius;
    }
    if (borderRadius === 0) {
      const plane = new PlaneGeometry(width, height);
      this.setIndex(plane.index);
      this.setAttribute("position", plane.getAttribute("position"));
      this.setAttribute("uv", plane.getAttribute("uv"));
      this.setAttribute("normal", plane.getAttribute("normal"));
    } else {
      const x = -width / 2;
      const y = -height / 2;
      const shape = new Shape();
      shape.moveTo(x, y + radius[0]);
      shape.lineTo(x, -y - radius[0]);

      if (radius[0] !== 0) {
        shape.absarc(
          x + radius[0],
          -y - radius[0],
          radius[0],
          -Math.PI,
          (-Math.PI * 3) / 2,
          true
        );
      }

      shape.lineTo(-x - radius[1], -y);

      if (radius[1] !== 0) {
        shape.absarc(
          -x - radius[1],
          -y - radius[1],
          radius[1],
          (-3 * Math.PI) / 2,
          2 * Math.PI,
          true
        );
        shape.lineTo(-x, y + radius[1]);
        shape.absarc(
          -x - radius[1],
          y + radius[1],
          radius[1],
          0,
          -Math.PI / 2,
          true
        );
      } else {
        shape.lineTo(-x, y);
      }

      shape.lineTo(x + radius[0], y);

      if (radius[0] !== 0) {
        shape.absarc(
          x + radius[0],
          y + radius[0],
          radius[0],
          -Math.PI / 2,
          -Math.PI,
          true
        );
      }
      const geo = new ShapeBufferGeometry(shape);

      const temp = new Vector3();
      const positions = geo.getAttribute("position");
      const uvs = geo.getAttribute("uv");
      const normals = geo.getAttribute("normal");

      for (let i = 0; i < positions.count; i++) {
        temp.fromBufferAttribute(positions, i);
        uvs.setXY(
          i,
          (temp.x + width / 2) / width,
          1 - (-temp.y + height / 2) / height
        );
      }

      const vertices: number[] = [];
      shape
        .getPoints()
        .slice()
        .forEach((p) => {
          vertices.push(p.x, p.y, 0);
        });
      this.setIndex(geo.index);
      this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
      this.setAttribute("uv", uvs);
      this.setAttribute("normal", normals);
    }
  }
}
