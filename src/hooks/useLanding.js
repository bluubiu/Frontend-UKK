import { useState, useEffect, useRef } from 'react';

/**
 * PARALLAX via requestAnimationFrame — mutates DOM directly, zero React re-renders.
 * Returns an array of refs; attach each ref to a DOM element.
 * factors[0] = slowest (background), factors[n-1] = fastest (foreground).
 */
export function useParallaxRefs(factors = [0.4, 0.22, -0.08]) {
    const refs = useRef(factors.map(() => ({ current: null })));

    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) return;

        let raf;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const y = window.scrollY;
                refs.current.forEach((ref, i) => {
                    if (ref.current) {
                        ref.current.style.transform = `translateY(${y * factors[i]}px)`;
                    }
                });
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return refs.current;
}

/** Fires once when element enters viewport, then disconnects. */
export function useInView(threshold = 0.14) {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, vis];
}

/** Scroll progress 0→1. Updates via rAF, no state loop. */
export function useScrollProgress() {
    const [prog, setProg] = useState(0);
    useEffect(() => {
        let raf;
        const h = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const el = document.documentElement;
                setProg(Math.min(el.scrollTop / (el.scrollHeight - el.clientHeight) || 0, 1));
            });
        };
        window.addEventListener('scroll', h, { passive: true });
        return () => { window.removeEventListener('scroll', h); cancelAnimationFrame(raf); };
    }, []);
    return prog;
}

/** Animates 0 → target when `active` becomes true. */
export function useCounter(target, active, duration = 1600) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!active) return;
        let cur = 0;
        const step = target / (duration / 16);
        const t = setInterval(() => {
            cur += step;
            if (cur >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(cur));
        }, 16);
        return () => clearInterval(t);
    }, [active, target, duration]);
    return val;
}

/** Active nav section based on scroll position. */
export function useScrollSpy(ids = [], offset = 130) {
    const [active, setActive] = useState(ids[0] || '');
    useEffect(() => {
        const h = () => {
            for (let i = ids.length - 1; i >= 0; i--) {
                const el = document.getElementById(ids[i]);
                if (el && window.scrollY >= el.offsetTop - offset) {
                    setActive(ids[i]); return;
                }
            }
        };
        window.addEventListener('scroll', h, { passive: true });
        return () => window.removeEventListener('scroll', h);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return active;
}
