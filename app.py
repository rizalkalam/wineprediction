from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os
import pandas as pd

app = Flask(__name__,
            static_folder=".", 
            static_url_path="",
            template_folder="views/ui")

# Load the model
model = None

def load_model():
    global model
    model_path = os.path.join("models", "model.pkl")
    try:
        model = joblib.load(model_path)
        print(f"Model loaded successfully: {type(model)}")
        print(f"Model parameters: {model.get_params()}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        return False

# Load model on startup
load_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict')
def predict_page():
    return render_template('predict.html')

@app.route('/about')
def about_page():
    return render_template('about.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.get_json()
        
        # Create a DataFrame with the input values
        input_data = {
            'fixed acidity': float(data['fixed_acidity']),
            'volatile acidity': float(data['volatile_acidity']),
            'citric acid': float(data['citric_acid']),
            'residual sugar': float(data['residual_sugar']),
            'chlorides': float(data['chlorides']),
            'free sulfur dioxide': float(data['free_sulfur_dioxide']),
            'total sulfur dioxide': float(data['total_sulfur_dioxide']),
            'density': float(data['density']),
            'pH': float(data['pH']),
            'sulphates': float(data['sulphates']),
            'alcohol': float(data['alcohol'])
        }
        
        # Convert to DataFrame
        input_df = pd.DataFrame([input_data])
        
        # Make prediction
        if model is None:
            if not load_model():
                return jsonify({'error': 'Model not available. Please try again later.'}), 500
        
        prediction = model.predict(input_df)
        probability = model.predict_proba(input_df)
        
        # Convert probability to list for JSON serialization
        probability_list = probability.tolist()
        
        # Get feature importance if available
        feature_importance = {}
        if hasattr(model, 'feature_importances_'):
            for idx, col in enumerate(input_data.keys()):
                feature_importance[col] = float(model.feature_importances_[idx])
        
        # Prepare response
        result = {
            'prediction': int(prediction[0]),
            'probability': probability_list[0],
            'class_labels': model.classes_.tolist(),
            'feature_importance': feature_importance
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)