"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vs = "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }";
const fs = [
  "precision highp float;",
  "varying vec2 vUv;",
  "uniform float uTime;",
  "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}",
  "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}",
  "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}",
  "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}",
  "float snoise(vec3 v){",
  "  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);",
  "  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);",
  "  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;",
  "  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);",
  "  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;",
  "  i=mod289(i);",
  "  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));",
  "  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;",
  "  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);",
  "  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);",
  "  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);",
  "  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;",
  "  vec4 sh=-step(h,vec4(0.0));",
  "  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;",
  "  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);",
  "  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));",
  "  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;",
  "  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;",
  "  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));",
  "}",
  "void main(){",
  "  vec2 uv=vUv;float ar=1920.0/1080.0;vec2 p=vec2(uv.x*ar,uv.y);float t=uTime*0.06;",
  "  float wx=snoise(vec3(p*1.4,t*0.5))*0.2;float wy=snoise(vec3(p*1.4+100.0,t*0.5))*0.2;",
  "  vec2 wp=p+vec2(wx,wy);",
  "  vec3 base=mix(vec3(0.10,0.02,0.22),vec3(0.04,0.10,0.25),smoothstep(0.0,1.0,uv.x*0.6+uv.y*0.4));",
  "  float angle=0.65;float ridgeUv=dot(wp,vec2(cos(angle),sin(angle)));",
  "  float ridge1=sin(ridgeUv*8.0+t*2.0+snoise(vec3(wp*0.8,t))*1.5);",
  "  float ridge2=sin(ridgeUv*5.5-t*1.4+snoise(vec3(wp*1.2+50.0,t*0.7))*2.0);",
  "  float ridge3=sin(ridgeUv*12.0+t*3.0+snoise(vec3(wp*0.6+80.0,t*0.4))*1.0);",
  "  float crease1=pow(abs(ridge1),0.35)*sign(ridge1)*0.5+0.5;",
  "  float crease2=pow(abs(ridge2),0.4)*sign(ridge2)*0.5+0.5;",
  "  float crease3=pow(abs(ridge3),0.5)*sign(ridge3)*0.5+0.5;",
  "  vec3 warm=mix(vec3(0.9,0.4,0.08),vec3(0.95,0.65,0.15),crease1);",
  "  float warmZone=smoothstep(0.15,0.75,uv.x+uv.y*0.4+snoise(vec3(uv*2.0,t))*0.3);",
  "  vec3 cool=mix(vec3(0.02,0.4,0.55),vec3(0.25,0.7,0.82),crease2);",
  "  float coolZone=smoothstep(0.25,0.85,1.2-uv.x+uv.y*0.5+snoise(vec3(uv*2.0+40.0,t*0.8))*0.25);",
  "  vec3 hot=mix(vec3(0.8,0.1,0.4),vec3(0.6,0.08,0.65),crease3);",
  "  float hotZone=smoothstep(0.5,0.9,snoise(vec3(uv*2.5+20.0,t*0.6))*0.5+0.5);",
  "  vec3 col=base;",
  "  col=mix(col,warm,warmZone*0.75*smoothstep(0.3,0.7,crease1));",
  "  col=mix(col,cool,coolZone*0.65*smoothstep(0.2,0.65,crease2));",
  "  col=mix(col,hot,hotZone*0.5*smoothstep(0.35,0.8,crease3));",
  "  float edgeGlow=pow(1.0-abs(ridge1),6.0)*0.4+pow(1.0-abs(ridge2),5.0)*0.25;",
  "  col+=edgeGlow*mix(warm,cool,uv.x)*0.8;",
  "  col*=1.0-pow(abs(ridge1),4.0)*0.15;",
  "  float vig=1.0-smoothstep(0.5,1.5,length((uv-0.5)*vec2(1.3,1.0)));",
  "  col*=0.65+vig*0.5;",
  "  float luma=dot(col,vec3(0.299,0.587,0.114));col=mix(vec3(luma),col,1.5);",
  "  col=clamp(col,0.0,1.0);col=pow(col,vec3(0.9));",
  "  col*=0.55;",
  "  gl_FragColor=vec4(col,1.0);",
  "}",
].join("\n");

export default function AuroraCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene    = new THREE.Scene();
    const camera   = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = { uTime: { value: 0.0 } };
    const material = new THREE.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, uniforms });
    scene.add(new THREE.Mesh(geometry, material));

    let animId;
    let startTime = null;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      if (startTime === null) startTime = performance.now();
      uniforms.uTime.value = (performance.now() - startTime) / 1000;
      renderer.render(scene, camera);
    };
    tick();

    const onResize = () => renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
}
