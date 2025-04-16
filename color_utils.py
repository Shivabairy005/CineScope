from sklearn.cluster import KMeans
from collections import Counter
import cv2
import numpy as np

# 🎨 Define color styles by HUE + SAT ranges
color_styles_hsv = {
    "Teal & Orange": lambda h, s: (15 <= h <= 25 or 180 <= h <= 210) and s > 80,
    "Cyberpunk":     lambda h, s: (260 <= h <= 290 or 300 <= h <= 330) and s > 60,
    "Sepia":         lambda h, s: (20 <= h <= 35) and s > 40,
    "Black & White": lambda h, s: s < 10,
    "Desaturated":   lambda h, s: 10 <= s < 40,
    "Pinkish Blue":  lambda h, s: (200 <= h <= 240) and 30 <= s <= 90,
    "Red":           lambda h, s: (0 <= h <= 10 or h >= 340) and s > 70,
}

def extract_dominant_hsv_colors(image, max_k=3):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    pixels = hsv.reshape(-1, 3)
    sample_size = max(1, int(len(pixels) * 0.1))
    sample = pixels[np.random.choice(len(pixels), sample_size, replace=False)]

    kmeans = KMeans(n_clusters=max_k, n_init=10, random_state=42)
    kmeans.fit(sample)

    return kmeans.cluster_centers_.astype(int)

def classify_color_grading(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    hue_channel = hsv[:, :, 0].flatten()     # Hue: 0-179
    sat_channel = hsv[:, :, 1].flatten()     # Saturation: 0-255

    avg_sat = np.mean(sat_channel)
    print(f"Avg Saturation: {avg_sat:.2f}")

    if avg_sat < 25:
        return "Black & White" if avg_sat < 10 else "Desaturated"

    # Count number of pixels in warm/cool hue ranges
    hue_bins = np.bincount(hue_channel, minlength=180)
    
    warm_pixels = np.sum(hue_bins[0:20]) + np.sum(hue_bins[160:180])  # Reds/Yellows
    cool_pixels = np.sum(hue_bins[90:140])                            # Blues/Cyans

    print(f"Warm: {warm_pixels}, Cool: {cool_pixels}")

    if warm_pixels > cool_pixels * 1.2:
        return "Warm Tones"
    elif cool_pixels > warm_pixels * 1.2:
        return "Cool Tones"
    else:
        return "Balanced / Natural"


def detect_shot_type(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) == 0:
        return "Wide Shot"

    height = frame.shape[0]
    for (_, _, _, h) in faces:
        ratio = h / height
        if ratio > 0.35:
            return "Close-Up"
        elif ratio > 0.2:
            return "Medium Shot"
        else:
            return "Wide Shot"

    return "Wide Shot"
