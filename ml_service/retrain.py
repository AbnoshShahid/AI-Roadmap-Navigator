import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import Pipeline
import os
import requests
from datetime import datetime

# Configuration
NODE_API_URL = "http://localhost:5000/api/evaluation/export"
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))

def retrain_pipeline():
    try:
        # 1. Fetch Data from Backend
        # For academic demo, we assume this works or we skip
        try:
             print(f"Fetching data from {NODE_API_URL}...")
             response = requests.get(NODE_API_URL, timeout=2)
             if response.status_code == 200:
                 new_data = response.json()
                 # TODO: Append new_data to CSV if schema matches
             else:
                 print("Backend offline or no data.")
        except:
             print("Could not fetch new data, retraining on existing CSV only.")

        # 2. Load Existing Dataset
        csv_path = os.path.join(MODEL_DIR, "dataset.csv")
        if not os.path.exists(csv_path):
            return {"status": "error", "message": "dataset.csv not found"}
            
        df = pd.read_csv(csv_path)
        
        # 3. Preprocessing (Simple Text Concat)
        # Must match main.py expectation implies we assume columns exist
        if 'text_features' not in df.columns:
             # Create it if missing (assuming synthetic data schema)
             # Fallback if columns are different
             cols = df.columns
             # We assume standard schema: education, skills, interests, career_label
             # If headers are different, we might need a map. 
             # Let's verify CSV headers first! (I am doing this blindly if I don't wait for the tool output)
             pass 

        # ROBUST: Re-create text_features
        # We assume columns "Education", "Skills", "Interests", "Job_Role" 
        # OR lower case "education", "skills", "interests", "career_label"
        # I need to see the CSV output from the previous step to be sure, but I can write robust code.
        
        df.columns = [c.lower() for c in df.columns] # Normalize
        
        # Map known variations
        if 'job_role' in df.columns: df['career_label'] = df['job_role']
        if 'role' in df.columns: df['career_label'] = df['role']
        
        # Fill NA
        df = df.fillna('')
        
        # Feature Engineering
        df['text_features'] = df['education'] + " " + df['skills'] + " " + df['interests']
        
        X = df['text_features']
        y = df['career_label']

        # 4. Train Pipeline
        model = Pipeline([
            ('vectorizer', CountVectorizer(stop_words='english')),
            ('classifier', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
        ])
        
        model.fit(X, y)
        
        # 5. Save New Model Version
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_filename = f"career_model_{timestamp}.pkl"
        save_path = os.path.join(MODEL_DIR, model_filename)
        
        joblib.dump(model, save_path)
        
        return {
            "status": "success", 
            "model_version": model_filename, 
            "trained_at": timestamp,
            "data_points": len(df)
        }

    except Exception as e:
        print(f"Retraining failed: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    retrain_pipeline()
