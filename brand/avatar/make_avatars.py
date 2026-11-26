#!/usr/bin/env python3
"""Build channel-avatar options from the letters of the Kısacası logo.

The glyphs (K and the ▶ "a") are cut straight out of the logo artwork, so the
letterforms match the wordmark exactly. Output: 800x800 PNGs (YouTube's
recommended avatar size) plus a preview sheet showing each option as a circle
at real YouTube sizes on light and dark backgrounds.

  python brand/avatar/make_avatars.py path/to/logo.png
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from scipy import ndimage

OUT = Path(__file__).resolve().parent
SIZE = 800

RED = (229, 28, 15)      # sampled from the logo
YELLOW = (247, 198, 0)   # banner yellow
BLUE = (30, 63, 174)     # banner blue
CREAM = (243, 235, 221)  # banner paper
WHITE = (255, 255, 255)


def extract_glyphs(logo_path):
    """Return soft (anti-aliased) alpha masks for K and for the ▶ 'a'."""
    rgb = np.asarray(Image.open(logo_path).convert("RGB")).astype(float)
    # how "red" each pixel is: 0 on white paper, 1 on solid logo red
    alpha = np.clip((255 - rgb[..., 1]) / (255 - RED[1]), 0, 1)
    # find letters with a strict "solid red" test, so anti-aliased edges don't glue them together
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    solid = (r > 150) & (g < 110) & (b < 110)
    lab, _ = ndimage.label(ndimage.binary_closing(solid))
    objs = ndimage.find_objects(lab)
    parts = sorted((s[1].start, i + 1) for i, s in enumerate(objs) if (lab[s] == i + 1).sum() > 500)
    first_id = parts[0][1]  # "Kı": the K touches the first ı
    # the ▶ "a" is the first letter after the K that encloses a hole (its play-triangle counter)
    a_id = next(i for _, i in parts[1:]
                if (ndimage.binary_fill_holes(lab == i) & ~(lab == i)).sum() > 200)

    def split(piece, choose):
        """Letters that touch: shrink until they come apart, keep one, grow it back.
        Returns the solid region and its own share of the soft edge pixels."""
        core, n = ndimage.label(ndimage.binary_erosion(piece, iterations=4))
        _, idx = ndimage.distance_transform_edt(core == 0, return_indices=True)
        nearest = core[idx[0], idx[1]]
        keep = choose(core, n)
        return piece & (nearest == keep), nearest == keep

    def largest(core, n):
        return 1 + int(np.argmax([(core == i).sum() for i in range(1, n + 1)]))

    # the K touches the first ı
    k_region, k_zone = split(lab == first_id, largest)
    # remove the spur left where the K touched the ı
    k_region = ndimage.binary_opening(k_region, structure=np.ones((3, 3)), iterations=4)
    k_region, _ = ndimage.label(k_region)
    k_region = k_region == 1 + int(np.argmax(np.bincount(k_region.ravel())[1:]))

    # the "a" may touch the "s": keep the part next to the ▶ counter
    a_piece = lab == a_id
    hole = ndimage.binary_fill_holes(a_piece) & ~a_piece
    hy, hx = ndimage.center_of_mass(hole)

    def nearest_to_hole(core, n):
        _, idx = ndimage.distance_transform_edt(core == 0, return_indices=True)
        return core[idx[0][int(hy), int(hx)], idx[1][int(hy), int(hx)]]

    a_region, a_zone = split(a_piece, nearest_to_hole)

    def soft(region, zone):
        grown = ndimage.binary_dilation(region, iterations=3) & zone
        a = np.where(grown, alpha, 0)
        ys, xs = np.where(region)
        return a[ys.min() - 3:ys.max() + 4, xs.min() - 3:xs.max() + 4]

    return soft(k_region, k_zone), soft(a_region, a_zone)


def smooth_upscale(mask, height):
    """Scale a soft mask up with clean edges: supersample, blur, threshold, downsample."""
    ss = 4
    w = round(mask.shape[1] * height / mask.shape[0])
    big = Image.fromarray((mask * 255).astype("uint8")).resize((w * ss, height * ss), Image.BICUBIC)
    big = big.filter(ImageFilter.GaussianBlur(ss * 2.0))
    solid = np.asarray(big) > 127
    # drop hairline spikes in inner corners and stray specks; fill pinholes but keep the ▶ counter
    solid = ndimage.binary_opening(solid, structure=np.ones((3, 3)), iterations=ss)
    lab, n = ndimage.label(solid)
    if n > 1:
        sizes = np.bincount(lab.ravel())[1:]
        solid = np.isin(lab, 1 + np.where(sizes > sizes.max() * 0.02)[0])
    holes_lab, hn = ndimage.label(ndimage.binary_fill_holes(solid) & ~solid)
    if hn:
        hsizes = np.bincount(holes_lab.ravel())[1:]
        solid |= np.isin(holes_lab, 1 + np.where(hsizes < solid.sum() * 0.005)[0])
    big = Image.fromarray((solid * 255).astype("uint8"))
    return big.resize((w, height), Image.LANCZOS)


def holes(mask_img):
    """The enclosed counters of a glyph (the ▶ inside the 'a')."""
    solid = np.asarray(mask_img) > 127
    filled = ndimage.binary_fill_holes(solid)
    return Image.fromarray(((filled & ~solid) * 255).astype("uint8"))


def compose(glyph, bg, fg, height, accent=None, nudge=(0, 0)):
    img = Image.new("RGB", (SIZE, SIZE), bg)
    g = smooth_upscale(glyph, height)
    x = (SIZE - g.width) // 2 + nudge[0]
    y = (SIZE - g.height) // 2 + nudge[1]
    img.paste(Image.new("RGB", g.size, fg), (x, y), g)
    if accent:  # colour the ▶ counter
        h = holes(g).filter(ImageFilter.GaussianBlur(0.6))
        img.paste(Image.new("RGB", g.size, accent), (x, y), h)
    return img


def preview_sheet(options):
    """Each option as a circle at YouTube's real sizes, on light and dark pages."""
    sizes = [176, 88, 40]  # channel page, comment/desktop, mobile feed
    pad, label_h, row_h = 28, 44, 176 + 56
    width = pad + 2 * (sum(sizes) + pad * len(sizes)) + pad * 2
    sheet = Image.new("RGB", (width, pad + label_h + row_h * len(options) + pad), (245, 245, 245))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("DejaVuSans-Bold.ttf", 22)
        small = ImageFont.truetype("DejaVuSans.ttf", 16)
    except OSError:
        font = small = ImageFont.load_default()
    half = width // 2
    draw.rectangle([half, 0, width, sheet.height], fill=(15, 15, 15))
    draw.text((pad, pad), "Acik tema", fill=(30, 30, 30), font=small)
    draw.text((half + pad, pad), "Koyu tema", fill=(230, 230, 230), font=small)
    for r, (name, img) in enumerate(options):
        top = pad + label_h + r * row_h
        for side, color in [(0, (30, 30, 30)), (half, (230, 230, 230))]:
            x = side + pad
            for s in sizes:
                av = img.resize((s, s), Image.LANCZOS)
                circle = Image.new("L", (s * 4, s * 4), 0)
                ImageDraw.Draw(circle).ellipse([0, 0, s * 4 - 1, s * 4 - 1], fill=255)
                sheet.paste(av, (x, top + (176 - s) // 2), circle.resize((s, s), Image.LANCZOS))
                x += s + pad
            draw.text((side + pad, top + 182), name, fill=color, font=font)
    return sheet


def main():
    logo = sys.argv[1] if len(sys.argv) > 1 else "logo.png"
    k, a = extract_glyphs(logo)
    options = [
        ("1 - Kirmizi zemin, beyaz K", compose(k, RED, WHITE, 430, nudge=(-6, 0))),
        ("2 - Kirmizi zemin, beyaz a", compose(a, RED, WHITE, 390)),
        ("3 - Kirmizi, beyaz a, sari play", compose(a, RED, WHITE, 390, accent=YELLOW)),
        ("4 - Krem zemin, kirmizi K", compose(k, CREAM, RED, 430, nudge=(-6, 0))),
        ("5 - Sari zemin, kirmizi a", compose(a, YELLOW, RED, 390)),
        ("6 - Mavi zemin, beyaz K", compose(k, BLUE, WHITE, 430, nudge=(-6, 0))),
    ]
    for name, img in options:
        img.save(OUT / f"avatar-{name.split(' ')[0]}.png")
    preview_sheet(options).save(OUT / "avatar-preview.png")
    print("wrote", len(options), "avatars and avatar-preview.png to", OUT)


if __name__ == "__main__":
    main()
