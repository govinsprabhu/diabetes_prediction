import os
from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load the trained model and scaler
# Using absolute paths or robust relative paths if running from varying directories
BASE_DIR = os.path.dirname(os.path.abspath(__name__))
model_path = os.path.join(BASE_DIR, 'diabetes_model.pkl')
scaler_path = os.path.join(BASE_DIR, 'scaler.pkl')

try:
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("Model and scaler loaded successfully.")
except Exception as e:
    print(f"Error loading model/scaler: {e}")
    model, scaler = None, None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({'error': 'Model or scaler not loaded properly on server.'}), 500
        
    try:
        # Get data from POST request
        data = request.json
        
        # We need to map exactly these fields: 
        # 'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
        features = [
            float(data.get('pregnancies', 0)),
            float(data.get('glucose', 0)),
            float(data.get('bloodPressure', 0)),
            float(data.get('skinThickness', 0)),
            float(data.get('insulin', 0)),
            float(data.get('bmi', 0)),
            float(data.get('diabetesPedigreeFunction', 0)),
            float(data.get('age', 0))
        ]
        
        # Convert to dataframe because our scaler/model might expect column names
        # based on how it was fit in the pipeline
        df_features = pd.DataFrame([features], columns=[
            'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 
            'BMI', 'DiabetesPedigreeFunction', 'Age'
        ])
        
        # Preprocess features using the saved scaler
        scaled_features = scaler.transform(df_features)
        
        # Predict using the saved model
        prediction = model.predict(scaled_features)
        
        # Return the prediction response
        result = int(prediction[0])
        return jsonify({
            'prediction': result,
            'message': 'Positive for Diabetes' if result == 1 else 'Negative for Diabetes'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)
