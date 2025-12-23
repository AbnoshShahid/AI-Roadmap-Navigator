from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import glob
from retrain import retrain_pipeline

# app = FastAPI() matched below with lifespan

# Global Model State
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
current_model = None
model_version = "v1-init"

def load_latest_model():
    global current_model, model_version
    try:
        # Find latest model file
        models = glob.glob(os.path.join(MODEL_DIR, "career_model_*.pkl"))
        if not models:
            # Fallback to default if no timestamped models
            models = glob.glob(os.path.join(MODEL_DIR, "model.joblib"))
            print(f"DEBUG: Checking for model.joblib in {MODEL_DIR}")
        
        if not models:
            print(f"DEBUG: No models found! Checked: {os.path.join(MODEL_DIR, 'career_model_*.pkl')} and {os.path.join(MODEL_DIR, 'model.joblib')}")
            print("No model found. Please run train_model.py first.")
            return

        latest_model_path = max(models, key=os.path.getctime)
        model_version = os.path.basename(latest_model_path)
        
        print(f"Loading model: {model_version} from {latest_model_path}")
        current_model = joblib.load(latest_model_path)
        print("DEBUG: Model loaded successfully into memory.")
        
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()

# Load on startup
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("DEBUG: Lifespan startup initiated.")
    load_latest_model()
    yield
    # Shutdown
    print("DEBUG: Lifespan shutdown.")

app = FastAPI(lifespan=lifespan)

class CareerRequest(BaseModel):
    education: str
    skills: list[str]
    interests: str

@app.post("/predict-career")
def predict_career(request: CareerRequest):
    if not current_model:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Preprocess input to match training format
    # Join skills list into string
    skills_str = " ".join(request.skills)
    text_features = [f"{request.education} {skills_str} {request.interests}"]

    # Predict probabilities
    try:
        # Get class probabilities
        probs = current_model.predict_proba(text_features)[0]
        classes = current_model.classes_

        # Create list of (role, confidence) tuples
        recommendations = []
        for role, prob in zip(classes, probs):
            if prob > 0.01: # Filter out very low probability
                recommendations.append({"role": role, "confidence": round(prob, 2)})
        
        # Sort by confidence desc
        recommendations.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Return top 3 + Metadata
        return {
            "recommendedCareers": recommendations[:3],
            "meta": {
                "model_version": model_version,
                "model_type": "RandomForest"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain")
def trigger_retraining():
    result = retrain_pipeline()
    if result["status"] == "success":
        # Reload immediately
        load_latest_model()
    return result

@app.get("/health")
def health_check():
    print(f"DEBUG: Health check called. current_model is {type(current_model)}")
    return {
        "status": "ok", 
        "model_loaded": current_model is not None,
        "model_version": model_version
    }

@app.post("/force-load")
def force_load():
    load_latest_model()
    return {"status": "reloaded", "model_version": model_version, "loaded": current_model is not None}
