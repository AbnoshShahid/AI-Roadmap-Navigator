import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

# 1. Load Data
# In a real app, this would query the database history.
# Here we use the synthetic CSV.
df = pd.read_csv("dataset.csv")

# 2. Preprocessing
# Combine features into a single text string for simplicity in this MVP
df['text_features'] = df['education'] + " " + df['skills'] + " " + df['interests']
X = df['text_features']
y = df['career_label']

# 3. Pipeline Construction
model = Pipeline([
    ('vectorizer', CountVectorizer(stop_words='english')),
    ('classifier', RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42))
])

# 4. Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Training
print("Training model...")
model.fit(X_train, y_train)

# 6. Evaluation
preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"Model Accuracy on Test Set: {acc:.2f}")

# 7. Persistence
from datetime import datetime
import os

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
model_filename = f"career_model_{timestamp}.pkl"
# Save to simple name for backup AND timestamped
joblib.dump(model, "model.joblib")
joblib.dump(model, model_filename)

print(f"Model saved to model.joblib AND {model_filename}")
