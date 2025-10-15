import pandas as pd
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
import json

base_file = 'python/data/KR_system_base.csv'
candidates = ['python/data/stock1.csv', 'python/data/stock2.csv']

df_base = pd.read_csv(base_file)
base_series = df_base['Close'].values

results = []

for file in candidates:
    df = pd.read_csv(file)
    target_series = df['Close'].values
    distance, _ = fastdtw(base_series, target_series, dist=euclidean)
    results.append({'file': file, 'distance': distance})

results = sorted(results, key=lambda x: x['distance'])

# 상위 3개 반환
top3 = results[:3]
print(json.dumps(top3))
