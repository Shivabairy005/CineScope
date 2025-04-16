from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import os
import tempfile
import numpy as np
import mediapipe as mp
from ultralytics import YOLO
from color_utils import classify_color_grading, detect_shot_type

app = Flask(__name__)
CORS(app)

model = YOLO("yolov8n.pt")
allowed_classes = {"person"}

mp_pose = mp.solutions.pose

def detect_action(landmarks, prev_landmarks, num_people=1):
    if not landmarks:
        return "No action detected"

    left_elbow_y = landmarks[13].y
    right_elbow_y = landmarks[14].y
    left_wrist_y = landmarks[15].y
    right_wrist_y = landmarks[16].y

    wrist_movement = 0
    if prev_landmarks:
        wrist_movement = np.linalg.norm(
            np.array([landmarks[15].x, landmarks[15].y]) -
            np.array([prev_landmarks[15].x, prev_landmarks[15].y])
        ) + np.linalg.norm(
            np.array([landmarks[16].x, landmarks[16].y]) -
            np.array([prev_landmarks[16].x, prev_landmarks[16].y])
        )

    if num_people >= 2 and wrist_movement > 0.2:
        return "Fighting"

    if left_wrist_y < left_elbow_y and right_wrist_y < right_elbow_y:
        return "Raising Hands"

    if prev_landmarks:
        movement = np.linalg.norm(
            np.array([landmarks[27].x, landmarks[27].y]) -
            np.array([prev_landmarks[27].x, prev_landmarks[27].y])
        )
        if movement > 0.1:
            return "Running"
        elif movement > 0.05:
            return "Walking"

    return "Standing Still"

def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    frame_interval = fps
    frame_count = 0
    prev_landmarks = None
    scene_data = {}

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % frame_interval == 0:
                timestamp_sec = frame_count // fps
                results = model(frame, conf=0.5)
                detected_objects = []

                for result in results:
                    for box in result.boxes:
                        class_id = int(box.cls[0])
                        label = model.names[class_id]
                        if label in allowed_classes:
                            detected_objects.append(label)

                person_count = detected_objects.count("person")

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pose_results = pose.process(rgb)

                if pose_results.pose_landmarks:
                    action = detect_action(
                        pose_results.pose_landmarks.landmark,
                        prev_landmarks,
                        person_count
                    )
                    prev_landmarks = pose_results.pose_landmarks.landmark
                else:
                    action = "No action detected"

                if action == "Running":
                    camera = "Tracking Shot"
                elif action == "Walking":
                    camera = "Medium Shot"
                else:
                    camera = "Wide Shot"

                color = classify_color_grading(frame)
                shot_type = detect_shot_type(frame)

                scene_data[timestamp_sec] = {
                    "objects": list(set(detected_objects)),
                    "actions": [action],
                    "camera_angle": shot_type,
                    "color_grade": color,
                    "dialogue": ""
                }

            frame_count += 1

    cap.release()
    return scene_data

def generate_screenplay(scene_data):
    screenplay = "EXT. UNKNOWN – DAY\n"
    prev_action = None
    prev_camera = None
    prev_objects = set()
    start_time = None

    sorted_timestamps = sorted(scene_data.keys())

    for idx, timestamp in enumerate(sorted_timestamps):
        details = scene_data[timestamp]
        actions = details.get("actions", [])
        if all(a.lower() == "no action detected" for a in actions):
            continue

        camera = details.get("camera_angle", "UNKNOWN").upper()
        objects = set(details.get("objects", []))
        dialogue = details.get("dialogue", "")

        if prev_action is None or actions[0] != prev_action or camera != prev_camera:
            if prev_action and prev_action.lower() != "no action detected":
                duration = timestamp - start_time
                screenplay += f"\n{ 'A PERSON'.center(80) }\n{ (prev_action.upper() + '.').center(80) }\n{ (prev_camera.upper() + f' – FOR {duration} SECONDS').center(80) }\n"

            prev_action = actions[0]
            prev_camera = camera
            prev_objects = objects
            start_time = timestamp
        else:
            prev_objects = prev_objects.union(objects)

        if idx == len(sorted_timestamps) - 1:
            duration = timestamp - start_time + 1
            if prev_action.lower() != "no action detected":
                screenplay += f"\n{ 'A PERSON'.center(80) }\n{ (prev_action.upper() + '.').center(80) }\n{ (prev_camera.upper() + f' – FOR {duration} SECONDS').center(80) }\n"

    return screenplay

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    video = request.files['file']
    temp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    video.save(temp.name)

    try:
        scene_data = process_video(temp.name)
        script = generate_screenplay(scene_data)
        first_scene = next(iter(scene_data.values()), {})
        return jsonify({
            'screenplay': script,
            'analysis': {
                'shot_type': first_scene.get("camera_angle", "Unknown"),
                'color_grade': first_scene.get("color_grade", "Uncategorized")
            }
        })
    finally:
        temp.close()
        try:
            os.remove(temp.name)
        except Exception:
            pass

if __name__ == "__main__":
    app.run(debug=True)
