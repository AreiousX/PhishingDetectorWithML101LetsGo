import uvicorn
from fastapi import FastAPI
import joblib
from pydantic import BaseModel
from typing import List
import socket
import urllib
from urllib.parse import urlencode, urlparse
import re


class Input(BaseModel):
    url: List[str]


result = []

app = FastAPI()

# pkl
phishing_detector = open(
    'E:/Codes/Python/ML Phising Detector/phishing_detector_1.pkl', 'rb')
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

        if re.findall(r'\b(?:[1-2]?[0-9]{1,2}\.){3}[1-2]?[0-9]{1,2}\b',url):
            ip = 1
        else:
            ip = 0

        if "@" in url:
            at = 1
        else:
            at = 0

        s = urlparse(url).path.split("/")
        depth = 0
        for j in range(len(s)):
            if len(s[j]) != 0:
                depth = depth + 1

        pos = url.rfind("//")
        if pos > 6:
            if pos > 7:
                redirect = 1
            else:
                redirect = 0
        else:
            redirect = 0

        p = urllib.parse.urlparse(url, 'http')
        netloc = p.netloc or p.path
        path = p.path if p.netloc else ''
        if not netloc.startswith('www.'):
            netloc = 'www.' + netloc

        p = (urllib.parse.ParseResult('http', netloc, path, *p[3:])).geturl()

        if "-" in urlparse(p).netloc:
            prefixSuffix = 1
        else:
            prefixSuffix = 0

        shortening_services = (
            r"bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|"
            r"yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|"
            r"short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|"
            r"doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|db\.tt|"
            r"qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|q\.gs|is\.gd|"
            r"po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|x\.co|"
            r"prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|"
            r"tr\.im|link\.zip\.net"
        )
        match = re.search(shortening_services, url)
        if match:
            urlshorten = 1
        else:
            urlshorten = 0

        if y_predict == [1]:
            output = {
                "URL": url,
                "result": predict,
                "probability": (y_probability[0, 1] * 100),
                "urlLength": len(url),
                "ipDetect": ip,
                "atDetect": at,
                "redirectDetect": redirect,
                "urlDepth": depth,
                "prefixSuffixDetect": prefixSuffix,
                "shortenDetect": urlshorten
            }
            result.append(output)

        else:
            output = {
                "URL": url,
                "result": predict,
                "probability": (y_probability[0, 0] * 100),
                "urlLength": len(url),
                "ipDetect": ip,
                "atDetect": at,
                "redirectDetect": redirect,
                "urlDepth": depth,
                "prefixSuffixDetect": prefixSuffix,
                "shortenDetect": urlshorten
            }
            result.append(output)

    return (result)


if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=2408)
