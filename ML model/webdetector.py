import uvicorn
from fastapi import FastAPI
FastAPI
import joblib
import os
import numpy as np
import json
import sys
from pydantic import BaseModel
from typing import List

class Input(BaseModel):
    url: List[str]

result = []

app = FastAPI()

# pkl
phishing_detector = open('E:/Codes/Python/ML Phising Detector/phishing_detector.pkl', 'rb')
phishing_detector_ls = joblib.load(phishing_detector)

# ML Aspect

@app.post('/')
async def predict(inputs: Input):
    result.clear()
    for url in inputs.url:
        X_predict = []
        X_predict.append(str(url))
        y_predict = phishing_detector_ls.predict(X_predict)
        y_probability = phishing_detector_ls.predict_proba(X_predict)
        predict = ' '.join(map(str, y_predict))
        if y_predict == [1]:
            output = {
                "URL" : url,
                "result" : predict, 
                "probability" : (y_probability[0,1] * 100),
                }
            result.append(output)
            
        else:
            output = {
                "URL" : url,
                "result" : predict, 
                "probability" : (y_probability[0,0] * 100)
            }
            result.append(output)
        
    return (result)
if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=2408)
