#!/usr/bin/env python3
"""Generate Android launcher + adaptive icon assets from src/assets/logoImage.png."""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...", file=sys.stderr)
    import subprocess

    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow", "-q"])
    from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/assets/logoImage.png"
RES = ROOT / "android/app/src/main/res"

LEGACY_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

FOREGROUND_SIZES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

BACKGROUND_COLOR = (255, 255, 255, 255)
PLAY_STORE_SIZE = 512


def make_transparent_foreground(source: Image.Image) -> Image.Image:
    rgba = source.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r < 40 and g < 40 and b < 40:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def compose_launcher(source: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), BACKGROUND_COLOR)
    foreground = make_transparent_foreground(source)
    foreground = foreground.resize((size, size), Image.Resampling.LANCZOS)
    canvas.alpha_composite(foreground)
    return canvas.convert("RGB")


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source icon: {SOURCE}")

    source = Image.open(SOURCE)
    foreground_master = make_transparent_foreground(source)

    for folder, size in LEGACY_SIZES.items():
        launcher = compose_launcher(source, size)
        target_dir = RES / folder
        save_png(launcher, target_dir / "ic_launcher.png")
        save_png(launcher, target_dir / "ic_launcher_round.png")

    for folder, size in FOREGROUND_SIZES.items():
        fg = foreground_master.resize((size, size), Image.Resampling.LANCZOS)
        save_png(fg, RES / folder / "ic_launcher_foreground.png")

    play_store = compose_launcher(source, PLAY_STORE_SIZE)
    store_dir = ROOT / "android/play-store"
    store_dir.mkdir(parents=True, exist_ok=True)
    save_png(play_store, store_dir / "ic_launcher-playstore.png")

    print("Android icons generated from logoImage.png")
    print(f"  Legacy launcher sizes: {', '.join(str(v) for v in LEGACY_SIZES.values())}px")
    print(f"  Play Store icon: {store_dir / 'ic_launcher-playstore.png'}")


if __name__ == "__main__":
    main()
