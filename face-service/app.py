from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import json

app = Flask(__name__)

# --- ENDPOINT PARA REGISTRAR (ENCODE) ---
@app.route('/encode', methods=['POST'])
def encode_face():
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400

    try:
        image = face_recognition.load_image_file(file)
        encodings = face_recognition.face_encodings(image)

        if len(encodings) > 0:
            return jsonify({'encoding': encodings[0].tolist()})
        else:
            return "No face found in the image", 400
    except Exception as e:
        return f"Error processing image: {e}", 500

# --- ENDPOINT PARA RECONOCER (RECOGNIZE) ---
@app.route('/recognize', methods=['POST'])
def recognize_face():
    if 'file' not in request.files:
        return "Missing image file", 400
    
    known_encodings_data = request.form.get('known_encodings')
    if not known_encodings_data:
        return "Missing known_encodings data", 400

    known_encodings_dict = json.loads(known_encodings_data)
    
    file_stream = request.files['file']
    unknown_image = face_recognition.load_image_file(file_stream)
    unknown_encodings = face_recognition.face_encodings(unknown_image)

    if not unknown_encodings:
        return jsonify({'match': False, 'person_id': None})

    unknown_encoding = unknown_encodings[0]

    known_ids = list(known_encodings_dict.keys())
    known_encodings = [np.array(enc) for enc in known_encodings_dict.values()]

    if len(known_encodings) == 0:
        return jsonify({'match': False, 'person_id': None})

    # --- ZONA DE DIAGNÓSTICO ---
    face_distances = face_recognition.face_distance(known_encodings, unknown_encoding)
    best_match_index = np.argmin(face_distances)
    best_match_distance = face_distances[best_match_index]
    
    print(f"--- DIAGNÓSTICO: Diferencia encontrada: {best_match_distance} ---", flush=True)

    # AJUSTE DE TOLERANCIA A 0.68
    tolerance = 0.68
    
    if best_match_distance <= tolerance:
        matched_person_id = known_ids[best_match_index]
        return jsonify({'match': True, 'person_id': int(matched_person_id)})

    return jsonify({'match': False, 'person_id': None})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)