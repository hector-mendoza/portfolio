import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

export function splitChars(el) {
  const text = el.textContent ?? '';
  el.textContent = '';
  const chars = [];

  text.split(' ').forEach((word, wi, arr) => {
    const wordSpan = document.createElement('span');
    wordSpan.style.display = 'inline-block';
    wordSpan.style.whiteSpace = 'nowrap';

    Array.from(word).forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      wordSpan.appendChild(span);
      chars.push(span);
    });

    el.appendChild(wordSpan);

    if (wi < arr.length - 1) {
      el.appendChild(document.createTextNode(' '));
    }
  });

  return chars;
}
