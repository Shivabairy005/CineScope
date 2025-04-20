import matplotlib
matplotlib.use('Agg')
from sklearn.cluster import KMeans
from collections import Counter
import cv2
import numpy as np
import matplotlib.pyplot as plt
import io
import base64

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
    dominant_hsv = extract_dominant_hsv_colors(image)
    detected_styles = []

    for h, s, _ in dominant_hsv:
        for style, condition in color_styles_hsv.items():
            if condition(h, s):
                detected_styles.append(style)
                break

    return Counter(detected_styles).most_common(1)[0][0] if detected_styles else "Uncategorized"

def get_color_swatch(image, max_k=5):
    img = cv2.resize(cv2.cvtColor(image, cv2.COLOR_BGR2RGB), (200, 200))
    pixels = img.reshape((-1, 3))  # Shape (40000, 3)
    sample_size = min(1000, len(pixels))
    sampled_pixels = pixels[np.random.choice(len(pixels), sample_size, replace=False)]

    kmeans = KMeans(n_clusters=max_k, n_init=10, random_state=42)
    kmeans.fit(sampled_pixels)
    colors = kmeans.cluster_centers_.astype(int)

    fig, ax = plt.subplots(figsize=(max_k * 1.5, 1))
    for i, color in enumerate(colors):
        ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color / 255))
    ax.set_xlim(0, max_k)
    ax.axis('off')

    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    buf.seek(0)

    return base64.b64encode(buf.read()).decode('utf-8')


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
