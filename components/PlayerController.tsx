"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/lib/store";
import { sound } from "@/lib/audio";
import { DISTRICTS } from "@/lib/data";
import { DistrictId } from "@/lib/types";

export default function PlayerController() {
  const { camera, gl } = useThree();
  const gameState = useGameStore((s) => s.gameState);
  const setGameState = useGameStore((s) => s.setGameState);
  const nearbyMemory = useGameStore((s) => s.nearbyMemory);
  const openMemory = useGameStore((s) => s.openMemory);
  const setCurrentDistrict = useGameStore((s) => s.setCurrentDistrict);
  const setPlayerPos = useGameStore((s) => s.setPlayerPos);

  const cameraRef = useRef(camera);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const keys = useRef<{ [key: string]: boolean }>({});
  const moveDirection = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const stepTimer = useRef(0);
  const walkDistance = useRef(0);

  // Sync camera position on mount / fast travel
  const storePos = useGameStore((s) => s.playerPos);
  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(storePos[0], storePos[1], storePos[2]);
    }
  }, [storePos]);

  // Global keydown / keyup handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;

      // Interaction key [E]
      if (e.code === "KeyE") {
        if (nearbyMemory && gameState === "playing") {
          openMemory(nearbyMemory);
        } else if (gameState === "playing" && cameraRef.current) {
          // Check if near Rooftop elevator pad at [0, 0]
          const distToElevator = Math.hypot(cameraRef.current.position.x, cameraRef.current.position.z);
          if (distToElevator < 3.5) {
            if (cameraRef.current.position.y < 10) {
              cameraRef.current.position.set(0, 33.5, 6);
            } else {
              cameraRef.current.position.set(0, 1.6, 6);
            }
          }
        }
      }

      // Map key [M]
      if (e.code === "KeyM") {
        if (gameState === "playing") setGameState("map");
        else if (gameState === "map") setGameState("playing");
      }

      // Memories key [I]
      if (e.code === "KeyI") {
        if (gameState === "playing") setGameState("memories");
        else if (gameState === "memories") setGameState("playing");
      }

      // Escape key
      if (e.code === "Escape") {
        if (gameState === "map" || gameState === "memories" || gameState === "inspecting") {
          setGameState("playing");
        } else if (gameState === "playing") {
          setGameState("paused");
        } else if (gameState === "paused") {
          setGameState("playing");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, nearbyMemory, openMemory, setGameState]);

  // Mouse drag look & pointer lock support
  useEffect(() => {
    const dom = gl.domElement;

    const onMouseDown = (e: MouseEvent) => {
      if (gameState !== "playing") return;
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || gameState !== "playing" || !cameraRef.current) return;

      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.0028;
      euler.current.setFromQuaternion(cameraRef.current.quaternion);
      euler.current.y -= deltaX * sensitivity;
      euler.current.x -= deltaY * sensitivity;
      euler.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, euler.current.x));
      cameraRef.current.quaternion.setFromEuler(euler.current);
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    // Touch support for mobile look
    const onTouchStart = (e: TouchEvent) => {
      if (gameState !== "playing" || e.touches.length === 0) return;
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || gameState !== "playing" || e.touches.length === 0 || !cameraRef.current) return;
      const deltaX = e.touches[0].clientX - lastMousePos.current.x;
      const deltaY = e.touches[0].clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      const sensitivity = 0.0035;
      euler.current.setFromQuaternion(cameraRef.current.quaternion);
      euler.current.y -= deltaX * sensitivity;
      euler.current.x -= deltaY * sensitivity;
      euler.current.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, euler.current.x));
      cameraRef.current.quaternion.setFromEuler(euler.current);
    };

    const onTouchEnd = () => {
      isDragging.current = false;
    };

    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      dom.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl, gameState]);

  // Frame update for movement and footstep audio
  useFrame((state, delta) => {
    if (gameState !== "playing") return;

    const activeCam = state.camera;
    const isRunning = keys.current["ShiftLeft"] || keys.current["ShiftRight"];
    const speed = isRunning ? 9.5 : 5.2;

    moveDirection.current.set(0, 0, 0);

    if (keys.current["KeyW"] || keys.current["ArrowUp"]) moveDirection.current.z -= 1;
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) moveDirection.current.z += 1;
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) moveDirection.current.x -= 1;
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) moveDirection.current.x += 1;

    const isMoving = moveDirection.current.lengthSq() > 0;

    if (isMoving) {
      moveDirection.current.normalize();

      // Transform direction into camera local space (horizontal plane)
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(activeCam.quaternion);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(activeCam.quaternion);
      right.y = 0;
      right.normalize();

      velocity.current.x = (forward.x * -moveDirection.current.z + right.x * moveDirection.current.x) * speed;
      velocity.current.z = (forward.z * -moveDirection.current.z + right.z * moveDirection.current.x) * speed;

      // Apply movement to camera
      activeCam.position.x += velocity.current.x * delta;
      activeCam.position.z += velocity.current.z * delta;

      // Footstep sound & subtle head bob
      walkDistance.current += speed * delta;
      stepTimer.current += delta;
      const stepInterval = isRunning ? 0.32 : 0.48;
      if (stepTimer.current >= stepInterval) {
        sound.playFootstep();
        stepTimer.current = 0;
      }

      // Gentle head bobbing
      const baseHeight = activeCam.position.y > 15 ? 33.5 : 1.6;
      const bobAmount = isRunning ? 0.05 : 0.025;
      activeCam.position.y = baseHeight + Math.sin(walkDistance.current * 4) * bobAmount;
    }

    // World boundaries clamp
    activeCam.position.x = Math.max(-95, Math.min(95, activeCam.position.x));
    activeCam.position.z = Math.max(-95, Math.min(95, activeCam.position.z));

    // Update player position in state
    setPlayerPos([activeCam.position.x, activeCam.position.y, activeCam.position.z]);

    // Check which district player is currently standing in
    const px = activeCam.position.x;
    const pz = activeCam.position.z;
    const py = activeCam.position.y;

    if (py > 25) {
      setCurrentDistrict("rooftop");
    } else {
      let matchedDistrict: DistrictId = "central";
      for (const [id, d] of Object.entries(DISTRICTS)) {
        if (id === "rooftop") continue;
        if (
          px >= d.bounds.minX &&
          px <= d.bounds.maxX &&
          pz >= d.bounds.minZ &&
          pz <= d.bounds.maxZ
        ) {
          matchedDistrict = id as DistrictId;
          break;
        }
      }
      setCurrentDistrict(matchedDistrict);
    }
  });

  return null;
}
