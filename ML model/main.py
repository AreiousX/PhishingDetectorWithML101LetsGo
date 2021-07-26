from __future__ import absolute_import, division, print_function, unicode_literals

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from six.moves import urllib
import seaborn as sns
import time

from nltk.tokenize import RegexpTokenizer
from nltk.stem.snowball import SnowballStemmer

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from nltk.tokenize import RegexpTokenizer  
from nltk.stem.snowball import SnowballStemmer
from sklearn.feature_extraction.text import CountVectorizer 
from sklearn.pipeline import make_pipeline

import pickle# use to dump model 

import tensorflow.compat.v2.feature_column as fc

import tensorflow as tf
print(tf.__version__)

dftrain = pd.read_csv('E:/Codes/Python/ML Phising Detector/Datasets/phishing_site_urls.csv')
dfeval = pd.read_csv('E:/Codes/Python/ML Phising Detector/Datasets/test.csv')

label_counts = pd.DataFrame(dftrain.Label.value_counts())
print(label_counts)

sns.set_style('darkgrid')
sns.barplot(label_counts.index,label_counts.Label)

def treat_data(datain):
    tokenizer = RegexpTokenizer(r'[A-Za-z]+')
    tokenizer.tokenize(datain.URL[0])
    print('Getting words tokenized ...')
    t0= time.perf_counter()
    datain['text_tokenized'] = datain.URL.map(lambda t: tokenizer.tokenize(t))
    t1 = time.perf_counter() - t0
    print('Time taken',t1 ,'sec')

    stemmer = SnowballStemmer("english")
    print('Getting words stemmed ...')
    t0= time.perf_counter()
    datain['text_stemmed'] = datain['text_tokenized'].map(lambda l: [stemmer.stem(word) for word in l])
    t1= time.perf_counter() - t0
    print('Time taken',t1 ,'sec')

    print('Getting joiningwords ...')
    t0= time.perf_counter()
    datain['text_sent'] = datain['text_stemmed'].map(lambda l: ' '.join(l))
    t1= time.perf_counter() - t0
    print('Time taken',t1 ,'sec')

    dataout = datain
    return dataout

dftrain = treat_data(dftrain)
dftrain.shape
dftrain.sample(10)

dfeval = treat_data(dfeval)
dfeval.shape
dfeval.sample(10)

cv = CountVectorizer()
feature = cv.fit_transform(dftrain.text_sent)
feature[:5].toarray()

trainX, testX, trainY, testY = train_test_split(feature, dftrain.Label)

lr = LogisticRegression(max_iter=5000)
lr.fit(trainX,trainY)

lr.score(testX,testY)

Scores_ml = {}
Scores_ml['Logistic Regression'] = np.round(lr.score(testX,testY),2)

print('Training Accuracy :',lr.score(trainX,trainY))
print('Testing Accuracy :',lr.score(testX,testY))
con_mat = pd.DataFrame(confusion_matrix(lr.predict(testX), testY),
            columns = ['Predicted:Bad', 'Predicted:Good'],
            index = ['Actual:Bad', 'Actual:Good'])


print('\nCLASSIFICATION REPORT\n')
print(classification_report(lr.predict(testX), testY,
                            target_names =['Bad','Good']))

print('\nCONFUSION MATRIX')
plt.figure(figsize= (6,4))
sns.heatmap(con_mat, annot = True,fmt='d',cmap="YlGnBu")

pipeline_ls = make_pipeline(CountVectorizer(tokenizer = RegexpTokenizer(r'[A-Za-z]+').tokenize,stop_words='english'), LogisticRegression(max_iter=5000))
trainX, testX, trainY, testY = train_test_split(dftrain.URL, dftrain.Label)
pipeline_ls.fit(trainX,trainY)

pipeline_ls.score(testX,testY)
pickle.dump(pipeline_ls,open('phishing_detector.pkl','wb'))

loaded_model = pickle.load(open('E:/Codes/Python/ML Phising Detector/phishing_detector.pkl', 'rb'))

test = ['https://github.com/taruntiwarihp/Projects_DS/blob/master/Phishing Site URLs Prediction/prediction_app.py']
probability = loaded_model.predict_proba(test)
result = loaded_model.predict(test)
print(probability, result)