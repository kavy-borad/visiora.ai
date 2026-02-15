import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';

export function useThemeLogo(originalSrc: string) {
    const [logoSrc, setLogoSrc] = useState(originalSrc);
    const { theme } = useTheme();

    useEffect(() => {
        const img = new Image();
        img.src = originalSrc;
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Target Colors (Visiora Theme)
            // Dark Slate (for Dark Blue parts)
            const COLOR_DARK = { r: 30, g: 41, b: 59 };      // #1e293b
            // Primary Teal (for Medium Blue parts - dominant)
            const COLOR_PRIMARY = { r: 20, g: 184, b: 166 }; // #14b8a6
            // Light Teal (for Green parts)
            const COLOR_LIGHT = { r: 94, g: 234, b: 212 };   // #5eead4

            // White (for Dark Mode text/highlights if needed)
            const COLOR_WHITE = { r: 255, g: 255, b: 255 };

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                if (a < 10) continue;

                // 1. Detect Dark Blue/Navy regions (Map to Dark Slate)
                // Logic: High Blue, very low Red/Green
                if (b > r && b > g && r < 60 && g < 80) {
                    data[i] = COLOR_DARK.r;
                    data[i + 1] = COLOR_DARK.g;
                    data[i + 2] = COLOR_DARK.b;
                }
                // 2. Detect Green regions (Map to Light Teal)
                // Logic: Green is dominant
                else if (g > r && g > b) {
                    data[i] = COLOR_LIGHT.r;
                    data[i + 1] = COLOR_LIGHT.g;
                    data[i + 2] = COLOR_LIGHT.b;
                }
                // 3. Detect Medium/Light Blue (Map to Primary Teal)
                // Logic: Blue is dominant but brighter
                else if (b > r && b > g) {
                    data[i] = COLOR_PRIMARY.r;
                    data[i + 1] = COLOR_PRIMARY.g;
                    data[i + 2] = COLOR_PRIMARY.b;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            setLogoSrc(canvas.toDataURL());
        };
    }, [originalSrc, theme]); // Re-run if theme changes (though mapping is constant for now)

    return logoSrc;
}
