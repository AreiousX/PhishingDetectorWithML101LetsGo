import uvicorn
from fastapi import FastAPI
import joblib
import os
import numpy as np
import json
import sys

app = FastAPI()

# pkl
phishing_detector = open('E:/Codes/Python/ML Phising Detector/phishing_detector.pkl', 'rb')
phishing_detector_ls = joblib.load(phishing_detector)

# ML Aspect

@app.get('/')
async def predict(input):
    X_predict = []
    X_predict.append(str(input))
    y_predict = phishing_detector_ls.predict(X_predict)
    y_probability = phishing_detector_ls.predict_proba(X_predict)
    predict = ' '.join(map(str, y_predict))
    if y_predict == [1]:
        output = {
            "result" : predict, 
            "probability" : (y_probability[0,1] * 100),
            }
        result = output
    else:
        output = {
            "result" : predict, 
            "probability" : (y_probability[0,0] * 100)
        }
        result = output
        URL = {"URL" : input}
        
        return (URL, result)
if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=2408)
