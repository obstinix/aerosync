# AEROSYNC — Design System Contract

> Derived from SpaceX visual language: stark black surfaces, full-bleed data,
> futuristic monospace, single cold accent. Zero decoration.

---

## Colors

| Token              | Value                        | Usage                              |
|--------------------|------------------------------|-------------------------------------|
| `--bg`             | `#000000`                    | Page background                    |
| `--surface`        | `#0d0d0d`                    | Cards, panels                      |
| `--border`         | `rgba(255,255,255,0.08)`     | Hairline separators                |
| `--text-primary`   | `#F5F5F5`                    | Headings, body text                |
| `--text-secondary` | `#888888`                    | Labels, captions                   |
| `--text-muted`     | `#555555`                    | Disabled, landed status            |
| `--accent`         | `#00D4FF`                    | CTAs, data highlights, LIVE badge  |
| `--danger`         | `#FF4444`                    | DELAYED, critical alerts           |
| `--warning`        | `#FFB800`                    | Warning-level alerts               |

## Typography

| Role       | Family           | Weight  | Tracking       |
|------------|------------------|---------|----------------|
| Display    | Space Grotesk    | 600–700 | -0.03em large  |
| Body       | Space Grotesk    | 400     | normal         |
| Data/Mono  | JetBrains Mono   | 400–500 | normal         |

Load via:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Spacing

4px grid. All spacing multiples of 4.

## Radius

Maximum 4px on data panels. No rounded corners > 4px.

## Borders

Use 1px hairline borders (`rgba(255,255,255,0.08)`) instead of shadows. Shadows are banned.

## BANNED

- Poppins, Montserrat, Inter fonts
- Purple gradients, neon pink, rainbow gradients
- White glow blobs, glassmorphism, backdrop-filter blur > 12px decorative
- Rounded corners > 4px on data panels
- box-shadow on any element
- Animated gradient backgrounds
- Stock icon packs that look like Heroicons defaults
