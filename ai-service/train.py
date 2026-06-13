import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import LabelEncoder
import joblib
import json
import os

DATA_PATH = "data/Airlines.csv"
MODEL_PATH = "models/delay_rf_v1.pkl"
COLS_PATH  = "models/feature_columns.json"

df = pd.read_csv(DATA_PATH)
print(f"Loaded {len(df)} rows.")

# Feature engineering
df = df.dropna()
categorical = ['Airline', 'AirportFrom', 'AirportTo']
for col in categorical:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))

features = ['Airline', 'AirportFrom', 'AirportTo', 'DayOfWeek', 'Time', 'Length']
X = df[features]
y = (df['Delay'] == 1).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred))
print(f"AUC-ROC: {roc_auc_score(y_test, y_prob):.4f}")

os.makedirs("models", exist_ok=True)
joblib.dump(model, MODEL_PATH)
json.dump(features, open(COLS_PATH, 'w'))
print(f"Model saved to {MODEL_PATH}")
