import {
  DEFAULT_PITCH,
  DEFAULT_YAW,
  ORBIT_RADIUS,
} from "./camera";

const EASE_RATE = 10;
const YAW_RANGE = 0.42;
const PITCH_RANGE = 0.22;

export function installWindowParallaxInput() {
  let targetYaw = DEFAULT_YAW;
  let targetPitch = DEFAULT_PITCH;
  let yaw = targetYaw;
  let pitch = targetPitch;
  const radius = ORBIT_RADIUS;

  const onMove = (event: PointerEvent) => {
    const nx = event.clientX / Math.max(1, window.innerWidth) - 0.5;
    const ny = event.clientY / Math.max(1, window.innerHeight) - 0.5;
    targetYaw = DEFAULT_YAW + nx * YAW_RANGE;
    targetPitch = DEFAULT_PITCH - ny * PITCH_RANGE;
  };

  window.addEventListener("pointermove", onMove, { passive: true });

  return {
    get yaw() {
      return yaw;
    },
    get pitch() {
      return pitch;
    },
    get radius() {
      return radius;
    },
    advance(deltaTime: number) {
      const blend =
        1 - Math.exp(-EASE_RATE * Math.max(0, Math.min(0.1, deltaTime)));
      yaw += (targetYaw - yaw) * blend;
      pitch += (targetPitch - pitch) * blend;
    },
    dispose() {
      window.removeEventListener("pointermove", onMove);
    },
  };
}
